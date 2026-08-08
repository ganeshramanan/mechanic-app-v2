import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import { getWhatsAppReminders } from "../api";

function WhatsApp({ onBack }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReminders() {
    try {
      setLoading(true);
      setError("");

      const data = await getWhatsAppReminders();

      console.log("WhatsApp reminders API response:", data);

      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("WhatsApp reminders error:", err);
      setError(err.message || "Failed to load WhatsApp reminders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, []);

  function handleWhatsApp(reminder) {
    if (!reminder.whatsapp_url) {
      alert("WhatsApp link is not available for this customer.");
      return;
    }

    window.open(reminder.whatsapp_url, "_blank", "noopener,noreferrer");
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
              <h1 className="text-xl font-bold">WhatsApp Reminders</h1>

              <p className="text-sm text-slate-500">
                Contact customers about upcoming services
              </p>
            </div>
          </div>

          <button
            onClick={loadReminders}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* Page intro */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Customer Follow-ups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customers whose vehicles are due or overdue for service.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-orange-500"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              Loading reminders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-600">
              Unable to load reminders
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>

            <button
              onClick={loadReminders}
              className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reminders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <MessageCircle size={27} />
            </div>

            <h3 className="mt-4 font-bold">No reminders right now</h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no customers due for service within the next 7 days.
            </p>
          </div>
        )}

        {/* Reminder cards */}
        {!loading && !error && reminders.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {reminders.map((reminder) => {
              const isOverdue = reminder.status?.toUpperCase() === "OVERDUE";

              return (
                <div
                  key={reminder.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          isOverdue
                            ? "bg-red-50 text-red-500"
                            : "bg-orange-50 text-orange-500"
                        }`}
                      >
                        <Bike size={22} />
                      </div>

                      <div>
                        <p className="font-bold">{reminder.vehicle_number}</p>

                        <p className="text-sm text-slate-500">
                          {reminder.bike_model || "Bike model not available"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isOverdue
                          ? "bg-red-50 text-red-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {isOverdue ? "OVERDUE" : "DUE SOON"}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="px-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Customer
                        </p>

                        <p className="mt-1 font-semibold">
                          {reminder.customer_name || "Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-semibold">
                          <Phone size={15} />
                          {reminder.phone_number || "Not available"}
                        </p>
                      </div>
                    </div>

                    {/* Due date */}
                    <div
                      className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 ${
                        isOverdue ? "bg-red-50" : "bg-orange-50"
                      }`}
                    >
                      <CalendarClock
                        size={19}
                        className={
                          isOverdue ? "text-red-500" : "text-orange-500"
                        }
                      />

                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isOverdue ? "text-red-500" : "text-orange-600"
                          }`}
                        >
                          {isOverdue ? "Service overdue" : "Service due"}
                        </p>

                        <p
                          className={`text-sm font-bold ${
                            isOverdue ? "text-red-700" : "text-orange-700"
                          }`}
                        >
                          {reminder.next_service_date}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp button */}
                    <button
                      onClick={() => handleWhatsApp(reminder)}
                      disabled={!reminder.whatsapp_url}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <MessageCircle size={18} />

                      {reminder.whatsapp_url
                        ? "Send WhatsApp Reminder"
                        : "WhatsApp Unavailable"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default WhatsApp;
