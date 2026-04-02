/// ShelShare — Sealed Files
///
/// A trustless file-access-control layer on top of Shelby Protocol.
/// Files are AES-256 encrypted client-side before upload to Shelby.
/// The AES key is stored in this contract and released only when the
/// caller satisfies the on-chain condition.
///
/// Condition types:
///   1 = PAY     — pay a set APT price to get the key
///   2 = TIME    — key unlocks at a specific Unix timestamp
///   3 = BURN    — key is claimable exactly once, then gone
///
/// Architecture note: the AES key stored here is visible to Aptos
/// validators (all state is public). For most use-cases (pay-to-download,
/// time capsules, burn-after-read) this is acceptable. Full cryptographic
/// privacy would require threshold encryption — planned for v2.

module sealed::sealed_files {
    use std::signer;
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};

    // -----------------------------------------------------------------------
    // Error codes
    // -----------------------------------------------------------------------

    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_INITIALIZED: u64    = 2;
    const E_ALREADY_EXISTS: u64     = 3;
    const E_NOT_FOUND: u64          = 4;
    const E_WRONG_CONDITION: u64    = 5;
    const E_ALREADY_CLAIMED: u64    = 6;
    const E_TIME_NOT_REACHED: u64   = 7;
    const E_SELF_UNLOCK: u64        = 8;

    // -----------------------------------------------------------------------
    // Condition type constants
    // -----------------------------------------------------------------------

    const CONDITION_PAY:  u8 = 1;
    const CONDITION_TIME: u8 = 2;
    const CONDITION_BURN: u8 = 3;

    // -----------------------------------------------------------------------
    // Structs
    // -----------------------------------------------------------------------

    struct SealedFile has store, drop {
        shelby_address: String,
        /// AES-256 key bytes produced by the browser before upload
        aes_key: vector<u8>,
        condition_type: u8,
        /// PAY: price in APT octas (1 APT = 100_000_000 octas)
        price_octas: u64,
        /// TIME: Unix seconds at which the key becomes freely available
        unlock_timestamp: u64,
        creator: address,
        /// BURN / PAY: true once claimed
        claimed: bool,
    }

    struct Registry has key {
        seals: Table<String, SealedFile>,
        seal_created_events:  EventHandle<SealCreatedEvent>,
        seal_unlocked_events: EventHandle<SealUnlockedEvent>,
    }

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    struct SealCreatedEvent has drop, store {
        short_id:         String,
        creator:          address,
        condition_type:   u8,
        price_octas:      u64,
        unlock_timestamp: u64,
    }

    /// Emitted when the unlock condition is met.
    /// The aes_key is included so the client can read it from the
    /// transaction receipt without requiring another RPC call.
    struct SealUnlockedEvent has drop, store {
        short_id:  String,
        unlocker:  address,
        aes_key:   vector<u8>,
    }

    // -----------------------------------------------------------------------
    // Initialisation (called once by the deployer)
    // -----------------------------------------------------------------------

    public entry fun initialize(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        assert!(!exists<Registry>(deployer_addr), E_ALREADY_INITIALIZED);

        move_to(deployer, Registry {
            seals: table::new(),
            seal_created_events:  account::new_event_handle<SealCreatedEvent>(deployer),
            seal_unlocked_events: account::new_event_handle<SealUnlockedEvent>(deployer),
        });
    }

    // -----------------------------------------------------------------------
    // Create a sealed file
    // -----------------------------------------------------------------------

    public entry fun create_seal(
        creator:          &signer,
        short_id:         String,
        shelby_address:   String,
        aes_key:          vector<u8>,
        condition_type:   u8,
        price_octas:      u64,
        unlock_timestamp: u64,
    ) acquires Registry {
        let registry = borrow_global_mut<Registry>(@sealed);

        assert!(
            !table::contains(&registry.seals, short_id),
            E_ALREADY_EXISTS
        );

        table::add(&mut registry.seals, short_id, SealedFile {
            shelby_address,
            aes_key,
            condition_type,
            price_octas,
            unlock_timestamp,
            creator: signer::address_of(creator),
            claimed: false,
        });

        event::emit_event(&mut registry.seal_created_events, SealCreatedEvent {
            short_id,
            creator:        signer::address_of(creator),
            condition_type,
            price_octas,
            unlock_timestamp,
        });
    }

    // -----------------------------------------------------------------------
    // Unlock — PAY condition
    // Transfers price_octas to the creator, returns key via event
    // -----------------------------------------------------------------------

    public entry fun unlock_pay(
        buyer:    &signer,
        short_id: String,
    ) acquires Registry {
        let buyer_addr = signer::address_of(buyer);
        let registry   = borrow_global_mut<Registry>(@sealed);

        assert!(table::contains(&registry.seals, short_id), E_NOT_FOUND);
        let seal = table::borrow_mut(&mut registry.seals, short_id);

        assert!(seal.condition_type == CONDITION_PAY, E_WRONG_CONDITION);
        assert!(buyer_addr != seal.creator, E_SELF_UNLOCK);
        // PAY seals can be purchased multiple times (it's a sale, not single-use)

        coin::transfer<AptosCoin>(buyer, seal.creator, seal.price_octas);

        event::emit_event(&mut registry.seal_unlocked_events, SealUnlockedEvent {
            short_id,
            unlocker: buyer_addr,
            aes_key:  seal.aes_key,
        });
    }

    // -----------------------------------------------------------------------
    // Unlock — TIME condition
    // Anyone can call once timestamp is passed
    // -----------------------------------------------------------------------

    public entry fun unlock_time(
        caller:   &signer,
        short_id: String,
    ) acquires Registry {
        let registry = borrow_global_mut<Registry>(@sealed);

        assert!(table::contains(&registry.seals, short_id), E_NOT_FOUND);
        let seal = table::borrow_mut(&mut registry.seals, short_id);

        assert!(seal.condition_type == CONDITION_TIME, E_WRONG_CONDITION);
        assert!(
            timestamp::now_seconds() >= seal.unlock_timestamp,
            E_TIME_NOT_REACHED
        );

        event::emit_event(&mut registry.seal_unlocked_events, SealUnlockedEvent {
            short_id,
            unlocker: signer::address_of(caller),
            aes_key:  seal.aes_key,
        });
    }

    // -----------------------------------------------------------------------
    // Unlock — BURN condition
    // First caller claims the key; seal is permanently marked as claimed
    // -----------------------------------------------------------------------

    public entry fun unlock_burn(
        claimer:  &signer,
        short_id: String,
    ) acquires Registry {
        let registry = borrow_global_mut<Registry>(@sealed);

        assert!(table::contains(&registry.seals, short_id), E_NOT_FOUND);
        let seal = table::borrow_mut(&mut registry.seals, short_id);

        assert!(seal.condition_type == CONDITION_BURN, E_WRONG_CONDITION);
        assert!(!seal.claimed, E_ALREADY_CLAIMED);

        seal.claimed = true;

        event::emit_event(&mut registry.seal_unlocked_events, SealUnlockedEvent {
            short_id,
            unlocker: signer::address_of(claimer),
            aes_key:  seal.aes_key,
        });
    }

    // -----------------------------------------------------------------------
    // View functions
    // -----------------------------------------------------------------------

    #[view]
    public fun get_seal_info(short_id: String): (u8, u64, u64, bool, address) acquires Registry {
        let registry = borrow_global<Registry>(@sealed);
        assert!(table::contains(&registry.seals, short_id), E_NOT_FOUND);
        let seal = table::borrow(&registry.seals, short_id);
        (
            seal.condition_type,
            seal.price_octas,
            seal.unlock_timestamp,
            seal.claimed,
            seal.creator,
        )
    }

    #[view]
    public fun is_claimed(short_id: String): bool acquires Registry {
        let registry = borrow_global<Registry>(@sealed);
        if (!table::contains(&registry.seals, short_id)) { return false };
        table::borrow(&registry.seals, short_id).claimed
    }

    #[view]
    public fun seal_exists(short_id: String): bool acquires Registry {
        let registry = borrow_global<Registry>(@sealed);
        table::contains(&registry.seals, short_id)
    }
}
