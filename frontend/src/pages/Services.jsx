import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  ChevronRight,
  Phone,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { getServices } from "../api";
import Bill from "./Bill";

function Services({ onBack }) {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBillId, setSelectedBillId] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const data = await getServices();

        setServices(Array.isArray(data) ? data : []);
        setFilteredServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter((service) => {
      return (
        service.vehicle_number?.toLowerCase().includes(value) ||
        service.bike_model?.toLowerCase().includes(value) ||
        service.customer_name?.toLowerCase().includes(value) ||
        service.phone_number?.toLowerCase().includes(value)
      );
    });

    setFilteredServices(filtered);
  }, [search, services]);

  function handleViewBill(serviceId) {
    setSelectedBillId(serviceId);
  }

  if (selectedBillId) {
    return (
      <Bill serviceId={selectedBillId} onBack={() => setSelectedBillId(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6">
          <button
            onClick={onBack}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Services</h1>
            <p className="text-sm text-slate-500">
              Manage workshop service records
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Page heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Service Records</h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all completed services.
          </p>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Search Services
          </label>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle number, customer, bike or phone"
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading services...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-600">
              Unable to load services
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Wrench size={36} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No services found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search.
            </p>
          </div>
        )}

        {/* Service records */}
        {!loading && !error && filteredServices.length > 0 && (
          <>
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Recent Service Records</h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredServices.length} service
                  {filteredServices.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Top section */}
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Bike size={24} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {service.vehicle_number}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {service.bike_model || "Bike model not available"}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-400">Service Date</p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                        <CalendarClock size={16} className="text-orange-500" />

                        {service.service_date}
                      </p>
                    </div>
                  </div>

                  {/* Customer information */}
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold">
                        <User size={15} className="text-slate-400" />

                        {service.customer_name || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold">
                        <Phone size={15} className="text-slate-400" />

                        {service.phone_number || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Next Service
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold text-orange-600">
                        <CalendarClock size={15} />

                        {service.next_service_date || "Not scheduled"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => handleViewBill(service.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      View Bill
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://mechanic-app-v2.onrender.com/bill/${service.id}/pdf`,
                          "_blank",
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Download Invoice
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Services;
