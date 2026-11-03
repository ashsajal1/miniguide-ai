export const dynamic = "force-dynamic";

import { getAnalyticsData } from "@/lib/analytics-service";
import { Suspense } from "react";
import AdminDashboard from "./admin-dashboard";
import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/"); // Redirect non-admins to home page
  }

  const analyticsData = await getAnalyticsData();

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
        <header className="mb-8">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.6rem)] text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Analytics and insights for the platform
          </p>
        </header>

        <Suspense fallback={<div>Loading analytics…</div>}>
          <AdminDashboard analyticsData={analyticsData} />
        </Suspense>
      </div>
    </div>
  );
}
