// Bare layout — page.tsx contains its own full OS shell (sidebar, topbar, canvas, toolbar)
export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
