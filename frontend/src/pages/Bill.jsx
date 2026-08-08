import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarClock,
  Download,
  Phone,
  User,
} from "lucide-react";
import { getBill } from "../api";

function Bill({ serviceId, onBack }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBill() {
      try {
        setLoading(true);
        setError("");

        const data = await getBill(serviceId);

        setBill(data);
      } catch (err) {
        console.error("Failed to load bill:", err);
        setError(err.message || "Failed to load bill");
      } finally {
        setLoading(false);
      }
    }

    loadBill();
  }, [serviceId]);

  function handleDownload() {
    window.open(
      `https://mechanic-app-v2.onrender.com/bill/${serviceId}/pdf`,
      "_blank",
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading bill...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-6">
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white"
          >
            <ArrowLeft size={18} />
            Back to Services
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-600">Unable to load bill</p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <h1 className="text-xl font-bold">Bill</h1>
              <p className="text-sm text-slate-500">Service invoice details</p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Download size={17} />
            <span className="hidden sm:inline">Download Invoice</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Invoice */}
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Invoice heading */}
          <div className="border-b border-slate-200 px-5 py-6 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <Bike size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">VT Motors</h2>
                    <p className="text-sm text-slate-500">
                      Bike Service Invoice
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Invoice
                </p>

                <p className="mt-1 text-lg font-bold">#{bill.id}</p>

                <p className="mt-1 text-sm text-slate-500">
                  {bill.service_date}
                </p>
              </div>
            </div>
          </div>

          {/* Customer / Vehicle */}
          <div className="grid gap-6 border-b border-slate-200 px-5 py-6 sm:grid-cols-2 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Customer
              </p>

              <p className="mt-2 flex items-center gap-2 font-semibold">
                <User size={17} className="text-slate-400" />
                {bill.customer_name}
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Phone size={16} />
                {bill.phone_number}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Vehicle
              </p>

              <p className="mt-2 flex items-center gap-2 font-semibold">
                <Bike size={17} className="text-slate-400" />
                {bill.vehicle_number}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {bill.bike_model || "Bike model not available"}
              </p>
            </div>
          </div>

          {/* Service date */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Service Date
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock size={16} className="text-orange-500" />
                  {bill.service_date}
                </p>
              </div>

              {bill.next_service_date && (
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Next Service
                  </p>

                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {bill.next_service_date}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Service items */}
          <div className="px-5 py-6 sm:px-8">
            <h3 className="mb-4 font-bold">Service Items</h3>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>Service</span>
                <span>Amount</span>
              </div>

              <div className="divide-y divide-slate-100">
                {(bill.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_auto] items-center px-4 py-4"
                  >
                    <span className="text-sm text-slate-700">{item.name}</span>

                    <span className="text-sm font-semibold">
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))}

                {(bill.items || []).length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No service items recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm rounded-xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Total Amount</span>

                  <span className="text-2xl font-bold">
                    ₹{Number(bill.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 text-center sm:px-8">
            <p className="text-sm font-semibold text-slate-700">
              Thank you for choosing VT Motors
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please keep this invoice for your service records.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Bill;
