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
import { API_BASE_URL } from "./api";

const stats = [
  {
    title: "Total Vehicles",
    value: "248",
    change: "+12 this month",
    icon: Bike,
  },
  {
    title: "Services Today",
    value: "18",
    change: "+4 from yesterday",
    icon: Wrench,
  },
  {
    title: "Due Soon",
    value: "7",
    change: "Next 7 days",
    icon: CalendarClock,
  },
  {
    title: "Revenue",
    value: "₹24,850",
    change: "This month",
    icon: CircleDollarSign,
  },
];

const recentServices = [
  {
    vehicle: "TN 09 AB 1234",
    bike: "Yamaha R15",
    customer: "Arun Kumar",
    service: "General Service",
    amount: "₹1,850",
    date: "Today, 10:32 AM",
  },
  {
    vehicle: "TN 10 CD 5678",
    bike: "Royal Enfield Classic",
    customer: "Prakash",
    service: "Oil Change",
    amount: "₹950",
    date: "Today, 09:45 AM",
  },
  {
    vehicle: "TN 11 EF 9012",
    bike: "Honda Activa",
    customer: "Suresh",
    service: "Brake Service",
    amount: "₹1,250",
    date: "Yesterday, 05:20 PM",
  },
  {
    vehicle: "TN 12 GH 3456",
    bike: "TVS Apache",
    customer: "Vijay",
    service: "Periodic Service",
    amount: "₹2,400",
    date: "Yesterday, 03:15 PM",
  },
];

const upcomingServices = [
  {
    vehicle: "TN 09 XY 1122",
    bike: "Yamaha MT-15",
    customer: "Rahul",
    due: "Tomorrow",
    status: "due",
  },
  {
    vehicle: "TN 10 AB 3344",
    bike: "Honda Shine",
    customer: "Karthik",
    due: "In 3 days",
    status: "soon",
  },
  {
    vehicle: "TN 12 CD 5566",
    bike: "Royal Enfield Hunter",
    customer: "Mohan",
    due: "In 5 days",
    status: "soon",
  },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (currentPage === "new-service") {
    return (
      <NewService
        onBack={() => setCurrentPage("dashboard")}
        onSaved={() => {
          // We will refresh dashboard data later
        }}
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
              <h1 className="text-lg font-bold tracking-wide">VT MOTORS</h1>
              <p className="text-xs text-slate-400">Service Management</p>
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
          <NavItem icon={Home} label="Dashboard" active />
          <NavItem icon={Wrench} label="Services" />
          <NavItem icon={Bike} label="Vehicles" />
          <NavItem icon={Users} label="Customers" />
          <NavItem icon={CalendarClock} label="Due Services" />
          <NavItem icon={MessageCircle} label="WhatsApp" />
          <NavItem icon={CircleDollarSign} label="Bills" />
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
                <p className="truncate text-sm font-semibold">VT Motors</p>
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
                <p className="text-sm text-slate-500">Saturday, August 8</p>
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
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Main grid */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {/* Recent services */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-bold">Recent Services</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest work completed at your workshop
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600">
                  View all
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recentServices.map((service) => (
                  <div
                    key={service.vehicle}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Bike size={22} />
                      </div>

                      <div>
                        <p className="font-semibold">{service.vehicle}</p>

                        <p className="mt-0.5 text-sm text-slate-500">
                          {service.bike} • {service.customer}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {service.service} • {service.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:block sm:text-right">
                      <p className="font-bold">{service.amount}</p>

                      <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming services */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Upcoming Services</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Customers to follow up
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                    <CalendarClock size={19} />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {upcomingServices.map((service) => (
                  <div key={service.vehicle} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          service.status === "due"
                            ? "bg-red-500"
                            : "bg-orange-400"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{service.vehicle}</p>

                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {service.bike} • {service.customer}
                        </p>

                        <p
                          className={`mt-2 text-xs font-semibold ${
                            service.status === "due"
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        >
                          {service.due}
                        </p>
                      </div>

                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

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
            <h3 className="mb-4 font-bold">Quick Actions</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                icon={Plus}
                title="New Service"
                description="Create service record"
              />

              <QuickAction
                icon={Search}
                title="Find Vehicle"
                description="Search service history"
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

function NavItem({ icon: Icon, label, active }) {
  return (
    <button
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
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="rounded-xl bg-orange-50 p-3 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-emerald-600">{change}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description }) {
  return (
    <button className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-600 transition group-hover:bg-orange-500 group-hover:text-white">
        <Icon size={20} />
      </div>

      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}

export default App;
