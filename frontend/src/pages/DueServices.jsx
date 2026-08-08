import {
  ArrowLeft,
  Bike,
  CalendarClock,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDueServices } from "../api";

function DueServices({ onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDueServices() {
    try {
      setLoading(true);
      setError("");

      const data = await getDueServices();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from due services API");
      }

      setServices(data);
    } catch (err) {
      console.error("Due services error:", err);
      setError(err.message || "Failed to load due services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDueServices();
  }, []);

  const overdueServices = services.filter(
    (service) => service.status === "OVERDUE",
  );

  const dueSoonServices = services.filter(
    (service) => service.status === "DUE_SOON",
  );

  function openWhatsApp(service) {
    if (!service.phone_number) {
      alert("Customer phone number is not available.");
      return;
    }

    const phone = String(service.phone_number).replace(/\D/g, "");

    if (!phone) {
      alert("Invalid customer phone number.");
      return;
    }

    const message = `🏍️ VT Motors Reminder

Vehicle: ${service.vehicle_number}
Bike: ${service.bike_model || "-"}
Due Date: ${service.next_service_date}

Please service your vehicle soon.`;

    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank");
  }

  function ServiceCard({ service, overdue = false }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                overdue
                  ? "bg-red-50 text-red-500"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <Bike size={24} />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-slate-900">
                {service.vehicle_number}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {service.bike_model || "Bike model not available"}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-700">
                {service.customer_name}
              </p>

              {service.phone_number && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone size={14} />
                  {service.phone_number}
                </p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              overdue
                ? "bg-red-50 text-red-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {overdue ? "OVERDUE" : "DUE SOON"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock
              size={17}
              className={overdue ? "text-red-500" : "text-orange-500"}
            />

            <div>
              <p className="text-xs text-slate-400">
                {overdue ? "Service was due on" : "Next service"}
              </p>

              <p
                className={`text-sm font-semibold ${
                  overdue ? "text-red-600" : "text-orange-600"
                }`}
              >
                {service.next_service_date}
              </p>
            </div>
          </div>

          <button
            onClick={() => openWhatsApp(service)}
            disabled={!service.phone_number}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={17} />
            WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-xl p-2 transition hover:bg-slate-100"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold">Due Services</h1>

              <p className="text-sm text-slate-500">
                Customers who need service follow-up
              </p>
            </div>
          </div>

          <button
            onClick={loadDueServices}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">Overdue</p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {overdueServices.length}
            </p>

            <p className="mt-1 text-xs text-red-500">
              Services requiring immediate follow-up
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <p className="text-sm font-medium text-orange-600">Due Soon</p>

            <p className="mt-2 text-3xl font-bold text-orange-700">
              {dueSoonServices.length}
            </p>

            <p className="mt-1 text-xs text-orange-500">
              Services due within the next 7 days
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={25}
              className="mx-auto animate-spin text-orange-500"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading due services...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-600">
              Unable to load due services
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>

            <button
              onClick={loadDueServices}
              className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <CalendarClock size={40} className="mx-auto text-slate-300" />

            <h2 className="mt-4 font-bold text-slate-700">No due services</h2>

            <p className="mt-1 text-sm text-slate-500">
              Great! There are no overdue or upcoming services right now.
            </p>
          </div>
        )}

        {/* Overdue */}
        {!loading && !error && overdueServices.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Overdue Services
              </h2>

              <p className="text-sm text-slate-500">
                Customers whose service date has already passed
              </p>
            </div>

            <div className="space-y-4">
              {overdueServices.map((service) => (
                <ServiceCard key={service.id} service={service} overdue />
              ))}
            </div>
          </section>
        )}

        {/* Due Soon */}
        {!loading && !error && dueSoonServices.length > 0 && (
          <section className={overdueServices.length > 0 ? "mt-8" : ""}>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Due Soon</h2>

              <p className="text-sm text-slate-500">
                Customers whose service is due within 7 days
              </p>
            </div>

            <div className="space-y-4">
              {dueSoonServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DueServices;
