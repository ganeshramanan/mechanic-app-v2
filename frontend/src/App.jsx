import {
  Bell,
  Bike,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import NewService from "./pages/NewService";
import VehicleHistory from "./pages/VehicleHistory";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import Services from "./pages/Services";
import { getDashboardStats, getDueServices, getRecentServices } from "./api";

const defaultStats = {
  total_vehicles: 0,
  services_today: 0,
  due_soon: 0,
  revenue: 0,
};


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Dashboard Services
  const [dashboardStats, setDashboardStats] = useState(defaultStats);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Recent Services
  const [recentServices, setRecentServices] = useState([]);
  const [loadingRecentServices, setLoadingRecentServices] = useState(true);
  const [recentServicesError, setRecentServicesError] = useState("");

  // Upcoming Services
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [loadingDueServices, setLoadingDueServices] = useState(true);
  const [dueServicesError, setDueServicesError] = useState("");

  // Load Recent Services
  useEffect(() => {
    async function loadRecentServices() {
      try {
        setLoadingRecentServices(true);
        setRecentServicesError("");

        const data = await getRecentServices();

        console.log("Recent services API response:", data);

        setRecentServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load recent services:", error);
        setRecentServicesError(
          error.message || "Failed to load recent services"
        );
      } finally {
        setLoadingRecentServices(false);
      }
    }

    loadRecentServices();
  }, []);

  


// Dashboard stats
useEffect(() => {
  async function loadDashboardStats() {
    try {
      setLoadingStats(true);
      setStatsError("");

      const data = await getDashboardStats();

      console.log("Dashboard stats API response:", data);

      setDashboardStats(data);
    } catch (error) {
      console.error(
        "Failed to load dashboard stats:",
        error
      );

      setStatsError(
        error.message || "Failed to load dashboard stats"
      );
    } finally {
      setLoadingStats(false);
    }
  }

  loadDashboardStats();
}, []);


  // Load Upcoming / Due Services
  useEffect(() => {
    async function loadDueServices() {
      try {
        setLoadingDueServices(true);
        setDueServicesError("");

        const data = await getDueServices();

        console.log("Due services API response:", data);

        setUpcomingServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load due services:", error);

        setDueServicesError(
          error.message || "Failed to load services"
        );
      } finally {
        setLoadingDueServices(false);
      }
    }

    loadDueServices();
  }, []);

if (currentPage === "vehicles") {
  return (
    <Vehicles
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}

if (currentPage === "services") {
    return (
      <Services
        onBack={() => setCurrentPage("dashboard")}
        onSaved={() => {
          setCurrentPage("dashboard");
        }}
      />
    );
  }
  
  // New Service page
  if (currentPage === "new-service") {
    return (
      <NewService
        onBack={() => setCurrentPage("dashboard")}
        onSaved={() => {
          setCurrentPage("dashboard");
        }}
      />
    );
  }

  // Vehicle history
  if (currentPage === "vehicle-history") {
  return (
    <VehicleHistory
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}

  //Customers
  if (currentPage === "customers") {
  return (
    <Customers
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}




  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen w-64 flex-col
          bg-slate-950 text-white transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
              <Bike size={25} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide">
                VT MOTORS
              </h1>

              <p className="text-xs text-slate-400">
                Service Management
              </p>
            </div>
          </div>

          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
         <NavItem
  icon={Home}
  label="Dashboard"
  active={currentPage === "dashboard"}
  onClick={() => {
    setCurrentPage("dashboard");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={Wrench}
  label="Services"
  onClick={() => {
    setCurrentPage("services");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={Bike}
  label="Vehicles"
  onClick={() => {
    setCurrentPage("vehicles");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={Users}
  label="Customers"
  onClick={() => {
    setCurrentPage("customers");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={CalendarClock}
  label="Due Services"
  onClick={() => {
    setCurrentPage("due-services");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={MessageCircle}
  label="WhatsApp"
  onClick={() => {
    setCurrentPage("whatsapp");
    setSidebarOpen(false);
  }}
/>

<NavItem
  icon={CircleDollarSign}
  label="Bills"
  onClick={() => {
    setCurrentPage("bills");
    setSidebarOpen(false);
  }}
/>


        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-white/10 p-3">
          <NavItem icon={Settings} label="Settings" />

          <div className="mt-4 rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold">
                VT
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  VT Motors
                </p>

                <p className="truncate text-xs text-slate-400">
                  Workshop Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">
              <button
                className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>

              <div>
                <p className="text-sm text-slate-500">
                  Saturday, August 8
                </p>

                <h2 className="text-lg font-bold sm:text-xl">
                  Good morning 👋
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">

              <button className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 sm:block">
                <Search size={20} />
              </button>

              <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50">
                <Bell size={20} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
              </button>

              <div className="hidden h-10 w-px bg-slate-200 sm:block" />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                VT
              </div>

            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">

          {/* Page title */}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Workshop Overview
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening at your workshop today.
              </p>
            </div>

            <button
              onClick={() => setCurrentPage("new-service")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
            >
              <Plus size={19} />
              New Service
            </button>

          </div>

         {/* Statistics */}
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

  <StatCard
    title="Total Vehicles"
    value={
      loadingStats
        ? "..."
        : dashboardStats.total_vehicles
    }
    change="Registered vehicles"
    icon={Bike}
  />

  <StatCard
    title="Services Today"
    value={
      loadingStats
        ? "..."
        : dashboardStats.services_today
    }
    change="Today's services"
    icon={Wrench}
  />

  <StatCard
    title="Due Soon"
    value={
      loadingStats
        ? "..."
        : dashboardStats.due_soon
    }
    change="Next 7 days"
    icon={CalendarClock}
  />

  <StatCard
    title="Revenue"
    value={
      loadingStats
        ? "..."
        : `₹${Number(
            dashboardStats.revenue || 0
          ).toLocaleString("en-IN")}`
    }
    change="This month"
    icon={CircleDollarSign}
  />

</div>

{statsError && (
  <p className="mt-2 text-xs text-red-500">
    Unable to load dashboard statistics: {statsError}
  </p>
)}




          {/* Main grid */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* ================= RECENT SERVICES ================= */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

                <div>
                  <h3 className="font-bold">
                    Recent Services
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest work completed at your workshop
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600">
                  View all
                  <ChevronRight size={16} />
                </button>

              </div>

              {/* Loading */}
              {loadingRecentServices && (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Loading recent services...
                </div>
              )}

              {/* Error */}
              {!loadingRecentServices && recentServicesError && (
                <div className="px-5 py-8 text-center">

                  <p className="text-sm font-medium text-red-500">
                    Unable to load recent services
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {recentServicesError}
                  </p>

                </div>
              )}

              {/* Empty */}
              {!loadingRecentServices &&
                !recentServicesError &&
                recentServices.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No recent services found.
                  </div>
                )}

              {/* Real API data */}
              {!loadingRecentServices &&
                !recentServicesError &&
                recentServices.length > 0 && (
                  <div className="divide-y divide-slate-100">

                    {recentServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >

                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <Bike size={22} />
                          </div>

                          <div>

                            <p className="font-semibold">
                              {service.vehicle_number}
                            </p>

                            <p className="mt-0.5 text-sm text-slate-500">
                              {service.bike_model || "-"} •{" "}
                              {service.customer_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Service • {service.service_date}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center justify-between sm:block sm:text-right">

                          <p className="font-bold">
                            ₹
                            {Number(service.total_amount || 0).toFixed(2)}
                          </p>

                          <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                            Completed
                          </span>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

            </section>

            {/* ================= UPCOMING SERVICES ================= */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-bold">
                      Upcoming Services
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Customers to follow up
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                    <CalendarClock size={19} />
                  </div>

                </div>

              </div>

              {/* Loading */}
              {loadingDueServices && (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Loading services...
                </div>
              )}

              {/* Error */}
              {!loadingDueServices && dueServicesError && (
                <div className="px-5 py-8 text-center">

                  <p className="text-sm font-medium text-red-500">
                    Unable to load services
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {dueServicesError}
                  </p>

                </div>
              )}

              {/* Empty */}
              {!loadingDueServices &&
                !dueServicesError &&
                upcomingServices.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No upcoming services found.
                  </div>
                )}

              {/* Real API data */}
              {!loadingDueServices &&
                !dueServicesError &&
                upcomingServices.length > 0 && (
                  <div className="divide-y divide-slate-100">

                    {upcomingServices.map((service) => {

                      const isOverdue =
                        service.status?.toUpperCase() === "OVERDUE";

                      return (
                        <div
                          key={service.id}
                          className="px-5 py-4"
                        >

                          <div className="flex items-start gap-3">

                            {/* Status dot */}
                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                isOverdue
                                  ? "bg-red-500"
                                  : "bg-orange-400"
                              }`}
                            />

                            <div className="min-w-0 flex-1">

                              {/* Vehicle */}
                              <p className="font-semibold">
                                {service.vehicle_number}
                              </p>

                              {/* Bike + customer */}
                              <p className="mt-0.5 truncate text-sm text-slate-500">
                                {service.bike_model ||
                                  "Bike model not available"}{" "}
                                • {service.customer_name}
                              </p>

                              {/* Next service date */}
                              <p
                                className={`mt-2 text-xs font-semibold ${
                                  isOverdue
                                    ? "text-red-500"
                                    : "text-orange-500"
                                }`}
                              >
                                {isOverdue
                                  ? `Overdue • ${service.next_service_date}`
                                  : `Next service • ${service.next_service_date}`}
                              </p>

                            </div>

                            {/* Status */}
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                isOverdue
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {service.status}
                            </span>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              <div className="border-t border-slate-100 p-4">

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  <ClipboardList size={17} />
                  Manage Due Services
                </button>

              </div>

            </section>

          </div>

          {/* Quick actions */}
          <section className="mt-6">

            <h3 className="mb-4 font-bold">
              Quick Actions
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAction
                icon={Plus}
                title="New Service"
                description="Create service record"
                onClick={() => setCurrentPage("new-service")}
              />

              <QuickAction
                icon={Search}
                title="Find Vehicle"
                description="Search service history"
                onClick={() => setCurrentPage("vehicle-history")}
              />

              <QuickAction
                icon={MessageCircle}
                title="WhatsApp Reminders"
                description="Contact due customers"
              />

              <QuickAction
                icon={Gauge}
                title="View Reports"
                description="Workshop performance"
              />

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={19} />
      <span>{label}</span>
    </button>
  );
}



function StatCard({ title, value, change, icon: Icon }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-3 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
          <Icon size={21} />
        </div>

      </div>

      <p className="mt-4 text-xs font-medium text-emerald-600">
        {change}
      </p>

    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >

      <div className="rounded-xl bg-slate-100 p-3 text-slate-600 transition group-hover:bg-orange-500 group-hover:text-white">
        <Icon size={20} />
      </div>

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

    </button>
  );
}

export default App;



