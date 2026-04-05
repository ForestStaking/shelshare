/**
 * Layout for public share pages (/f/[shortId]).
 * NavBar is inherited from root layout — no duplicate header needed.
 */

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
