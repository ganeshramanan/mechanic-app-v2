import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  Phone,
  Search,
  User,
} from "lucide-react";
import { getVehicles } from "../api";

function Vehicles({ onBack }) {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVehicles() {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicles();

        setVehicles(Array.isArray(data) ? data : []);
        setFilteredVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load vehicles:", err);
        setError(err.message || "Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredVehicles(vehicles);
      return;
    }

    const filtered = vehicles.filter((vehicle) => {
      return (
        vehicle.vehicle_number?.toLowerCase().includes(value) ||
        vehicle.bike_model?.toLowerCase().includes(value) ||
        vehicle.customer_name?.toLowerCase().includes(value) ||
        vehicle.phone_number?.toLowerCase().includes(value)
      );
    });

    setFilteredVehicles(filtered);
  }, [search, vehicles]);

  function handleViewHistory(vehicleNumber) {
    // Store the selected vehicle temporarily.
    // App.jsx can use this later if you want direct navigation.
    console.log("View history:", vehicleNumber);
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
            <h1 className="text-xl font-bold">Vehicles</h1>
            <p className="text-sm text-slate-500">Manage registered vehicles</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Page heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Vehicle Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View vehicles, customers and service information.
          </p>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Search Vehicle
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
            <p className="text-sm text-slate-500">Loading vehicles...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-600">
              Unable to load vehicles
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredVehicles.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Bike size={36} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No vehicles found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search.
            </p>
          </div>
        )}

        {/* Vehicle cards */}
        {!loading && !error && filteredVehicles.length > 0 && (
          <>
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Registered Vehicles</h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredVehicles.length} vehicle
                  {filteredVehicles.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Vehicle header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Bike size={24} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {vehicle.vehicle_number}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {vehicle.bike_model || "Bike model not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold">
                        <User size={15} className="text-slate-400" />
                        {vehicle.customer_name || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-semibold">
                        <Phone size={15} className="text-slate-400" />
                        {vehicle.phone_number || "Not available"}
                      </p>
                    </div>
                  </div>

                  {/* Service dates */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-400">
                        Last Service
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarClock size={15} className="text-slate-400" />

                        {vehicle.last_service_date
                          ? new Date(
                              vehicle.last_service_date,
                            ).toLocaleDateString("en-GB")
                          : "No service record"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-3">
                      <p className="text-xs font-medium text-orange-500">
                        Next Service
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-orange-700">
                        <CalendarClock size={15} />

                        {vehicle.next_service_date
                          ? new Date(
                              vehicle.next_service_date,
                            ).toLocaleDateString("en-GB")
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleViewHistory(vehicle.vehicle_number)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-500 hover:text-white"
                  >
                    <Search size={17} />
                    View Service History
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Vehicles;
