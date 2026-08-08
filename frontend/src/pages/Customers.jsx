import { ArrowLeft, Bike, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getCustomers } from "../api";

function Customers({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomers();

        console.log("Customers API response:", data);

        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load customers:", err);
        setError(err.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      String(customer.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(customer.phone || "").includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your workshop customers
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading customers...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center shadow-sm">
            <p className="font-semibold text-red-500">
              Unable to load customers
            </p>

            <p className="mt-2 text-sm text-slate-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredCustomers.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <Users size={40} className="mx-auto text-slate-300" />

            <p className="mt-4 font-semibold">No customers found</p>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different name or phone number."
                : "Customers will appear here after you create services."}
            </p>
          </div>
        )}

        {/* Customer List */}
        {!loading && !error && filteredCustomers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Customer List</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredCustomers.length} customer
                    {filteredCustomers.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                  <Users size={19} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                      {String(customer.name || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold">{customer.name}</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Bike size={17} className="text-slate-400" />

                      <div>
                        <p className="text-sm font-semibold">
                          {customer.vehicle_count}
                        </p>

                        <p className="text-xs text-slate-400">Vehicles</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {customer.service_count}
                      </p>

                      <p className="text-xs text-slate-400">Services</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Customers;
