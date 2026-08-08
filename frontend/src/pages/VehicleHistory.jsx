import { useState } from "react";
import { ArrowLeft, Bike, Search, Phone, CalendarClock } from "lucide-react";
import { getVehicleHistory } from "../api";

function VehicleHistory({ onBack }) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    const number = vehicleNumber.trim();

    if (!number) {
      setError("Please enter a vehicle number");
      setServices([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setServices([]);

      const data = await getVehicleHistory(number);

      if (!Array.isArray(data) || data.length === 0) {
        setError("No service history found for this vehicle.");
        return;
      }

      setServices(data);
    } catch (err) {
      console.error("Vehicle history error:", err);
      setError(err.message || "Failed to load vehicle history");
    } finally {
      setLoading(false);
    }
  }

  const vehicle = services[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
          <button
            onClick={onBack}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Vehicle History</h1>
            <p className="text-sm text-slate-500">
              Search previous service records
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Vehicle Number
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Example: TN01AB1234"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Vehicle Details */}
        {vehicle && !loading && (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Bike size={24} />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    {vehicle.vehicle_number}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {vehicle.bike_model || "Bike model not available"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold">{vehicle.customer_name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <Phone size={15} />
                    {vehicle.phone_number}
                  </p>
                </div>
              </div>
            </section>

            {/* Service History */}
            <section className="mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Service History</h2>

                <p className="text-sm text-slate-500">
                  {services.length} service record
                  {services.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-4">
                {services.map((service) => {
                  const total = (service.items || []).reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0,
                  );

                  return (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      {/* Service header */}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="flex items-center gap-2 font-semibold">
                            <CalendarClock
                              size={17}
                              className="text-orange-500"
                            />
                            {service.service_date}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Service #{service.id}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="text-xl font-bold">
                            ₹{total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-3 text-sm font-semibold">
                          Service Items
                        </p>

                        {(service.items || []).length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No service items recorded.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {service.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-slate-600">
                                  {item.name}
                                </span>

                                <span className="font-medium">
                                  ₹{Number(item.amount || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Next service */}
                      {service.next_service_date && (
                        <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3">
                          <p className="text-xs font-medium text-orange-600">
                            Next Service
                          </p>

                          <p className="mt-1 text-sm font-semibold text-orange-700">
                            {service.next_service_date}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default VehicleHistory;
