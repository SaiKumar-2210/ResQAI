import { ResQDashboard } from "@/components/dashboard/ResQDashboard";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ResQDashboard />
    </main>
  );
}
