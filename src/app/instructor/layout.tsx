import Navbar from "../../components/Navbar";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-8">{children}</main>
    </div>
  );
}
