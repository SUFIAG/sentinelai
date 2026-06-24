// This layout is removed to prevent duplicate layouts
// All dashboard pages should use the DashboardLayout component directly
export default function DashboardWrapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

