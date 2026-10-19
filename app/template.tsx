// Re-mounts on every navigation, so each page eases in instead of snapping on.
// Opacity only: a transform here would break the fixed header inside the page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
