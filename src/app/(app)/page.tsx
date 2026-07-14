import Link from "next/link";
import {
  Users,
  CalendarCheck,
  Wallet,
  TriangleAlert,
  Clock,
  Stethoscope,
  Pill,
  CheckCircle2,
  Package,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  formatFCFA,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  drugExpiryStatus,
  type Role,
} from "@/lib/constants";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart, VisitsChart, PaymentChart } from "./dashboard-charts";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDays(n: number) {
  const days: { key: string; label: string }[] = [];
  const base = startOfToday();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    });
  }
  return days;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const role = user.role as Role;
  const today = startOfToday();
  const since = new Date(today);
  since.setDate(since.getDate() - 13);

  const [
    patientCount,
    visitsToday,
    completedToday,
    waiting,
    withDoctor,
    atPharmacy,
    pendingRx,
    recentVisits,
    recentSales,
    drugs,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.visit.count({ where: { createdAt: { gte: today } } }),
    prisma.visit.count({
      where: { status: "COMPLETED", updatedAt: { gte: today } },
    }),
    prisma.visit.count({ where: { status: "WAITING" } }),
    prisma.visit.count({ where: { status: "WITH_DOCTOR" } }),
    prisma.visit.count({ where: { status: "PHARMACY" } }),
    prisma.prescription.count({
      where: { status: { in: ["PENDING", "PARTIALLY_DISPENSED"] } },
    }),
    prisma.visit.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.sale.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true },
    }),
    prisma.drug.findMany(),
  ]);

  // --- Aggregations -------------------------------------------------------
  const days = buildDays(14);
  const revenueByDay = new Map(days.map((d) => [d.key, 0]));
  const visitsByDay = new Map(days.map((d) => [d.key, 0]));

  for (const v of recentVisits) {
    const k = v.createdAt.toISOString().slice(0, 10);
    if (visitsByDay.has(k)) visitsByDay.set(k, visitsByDay.get(k)! + 1);
  }

  let revenueToday = 0;
  let itemsDispensedToday = 0;
  const paymentTotals = new Map<string, number>();

  for (const s of recentSales) {
    const k = s.createdAt.toISOString().slice(0, 10);
    if (revenueByDay.has(k))
      revenueByDay.set(k, revenueByDay.get(k)! + s.totalAmount);
    if (s.createdAt >= today) {
      revenueToday += s.totalAmount;
      itemsDispensedToday += s.items.reduce((sum, it) => sum + it.quantity, 0);
    }
    paymentTotals.set(
      s.paymentMethod,
      (paymentTotals.get(s.paymentMethod) ?? 0) + s.totalAmount,
    );
  }

  const revenueData = days.map((d) => ({
    day: d.label,
    revenue: revenueByDay.get(d.key)!,
  }));
  const visitsData = days.map((d) => ({
    day: d.label,
    visits: visitsByDay.get(d.key)!,
  }));
  const paymentData = PAYMENT_METHODS.map((m) => ({
    name: PAYMENT_METHOD_LABELS[m],
    value: paymentTotals.get(m) ?? 0,
  }));
  const weekRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const lowStock = drugs
    .filter((d) => d.quantityInStock <= d.reorderLevel)
    .sort((a, b) => a.quantityInStock - b.quantityInStock);
  const expiringSoon = drugs.filter((d) => {
    const s = drugExpiryStatus(d.expiryDate);
    return s === "expiring" || s === "expired";
  }).length;

  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const isPharm = role === "PHARMACIST";
  const isRecep = role === "RECEPTIONIST";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening at the hospital today.
        </p>
      </div>

      {/* KPI row — tailored to role */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(isAdmin || isRecep) && (
          <StatTile
            icon={Users}
            label="Total patients"
            value={patientCount}
            tint="bg-primary/10 text-primary"
          />
        )}
        {(isAdmin || isRecep || isDoctor) && (
          <StatTile
            icon={CalendarCheck}
            label="Visits today"
            value={visitsToday}
            tint="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          />
        )}
        {(isDoctor || isRecep) && (
          <StatTile
            icon={Clock}
            label="Waiting for doctor"
            value={waiting}
            tint="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          />
        )}
        {isDoctor && (
          <StatTile
            icon={CheckCircle2}
            label="Completed today"
            value={completedToday}
            tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          />
        )}
        {isRecep && (
          <StatTile
            icon={Stethoscope}
            label="With doctor"
            value={withDoctor}
            tint="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          />
        )}
        {(isAdmin || isPharm) && (
          <StatTile
            icon={Wallet}
            label="Revenue today"
            value={formatFCFA(revenueToday)}
            tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          />
        )}
        {isPharm && (
          <StatTile
            icon={Pill}
            label="Pending prescriptions"
            value={pendingRx}
            tint="bg-primary/10 text-primary"
          />
        )}
        {isPharm && (
          <StatTile
            icon={Package}
            label="Items dispensed today"
            value={itemsDispensedToday}
            tint="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          />
        )}
        {isAdmin && (
          <StatTile
            icon={Pill}
            label="Pending prescriptions"
            value={pendingRx}
            tint="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          />
        )}
        {(isAdmin || isPharm) && (
          <StatTile
            icon={TriangleAlert}
            label="Low-stock drugs"
            value={lowStock.length}
            tint="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          />
        )}
      </div>

      {/* Charts + panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {(isAdmin || isPharm) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Revenue · last 14 days</CardTitle>
              <p className="text-muted-foreground text-sm">
                Total {formatFCFA(weekRevenue)}
              </p>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>
        )}

        {(isAdmin || isDoctor || isRecep) && (
          <Card className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="text-base">Visits · last 14 days</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitsChart data={visitsData} />
            </CardContent>
          </Card>
        )}

        {(isAdmin || isPharm) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment methods</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentChart data={paymentData} />
            </CardContent>
          </Card>
        )}

        {(isAdmin || isPharm) && (
          <Card className="lg:col-span-1">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Low stock</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/pharmacy/inventory" />}
              >
                View <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  All drugs are above reorder level.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lowStock.slice(0, 6).map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">
                        {d.name} {d.strength ?? ""}
                      </span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {d.quantityInStock} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {expiringSoon > 0 && (
                <p className="text-muted-foreground mt-3 border-t pt-3 text-xs">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {expiringSoon}
                  </span>{" "}
                  drug(s) expired or expiring soon
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {(isDoctor || isRecep) && (
          <Card className="lg:col-span-3">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Queue snapshot</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/queue" />}>
                Open queue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold">{waiting}</div>
                <div className="text-muted-foreground text-xs">Waiting</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{withDoctor}</div>
                <div className="text-muted-foreground text-xs">With doctor</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{atPharmacy}</div>
                <div className="text-muted-foreground text-xs">At pharmacy</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
