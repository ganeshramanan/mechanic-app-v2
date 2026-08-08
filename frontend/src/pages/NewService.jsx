import { useState } from "react";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { createService } from "../api";

const emptyItem = {
  name: "",
  amount: "",
};

function NewService({ onBack, onSaved }) {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    vehicle_number: "",
    bike_model: "",
  });

  const [items, setItems] = useState([
    {
      name: "",
      amount: "",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((previous) => [
      ...previous,
      {
        ...emptyItem,
      },
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.customer_name.trim()) {
      setError("Please enter the customer name.");
      return;
    }

    if (!form.phone_number.trim()) {
      setError("Please enter the phone number.");
      return;
    }

    if (!form.vehicle_number.trim()) {
      setError("Please enter the vehicle number.");
      return;
    }

    if (!form.bike_model.trim()) {
      setError("Please enter the bike model.");
      return;
    }

    const validItems = items.filter(
      (item) => item.name.trim() && Number(item.amount) >= 0,
    );

    if (validItems.length === 0) {
      setError("Please add at least one service item.");
      return;
    }

    try {
      setSaving(true);

      const result = await createService({
        ...form,
        items: validItems.map((item) => ({
          name: item.name.trim(),
          amount: Number(item.amount),
        })),
      });

      setSuccess(`Service saved successfully. Service #${result.service_id}`);

      setForm({
        customer_name: "",
        phone_number: "",
        vehicle_number: "",
        bike_model: "",
      });

      setItems([
        {
          name: "",
          amount: "",
        },
      ]);

      if (onSaved) {
        onSaved(result);
      }
    } catch (err) {
      setError(err.message || "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <h1 className="text-lg font-bold sm:text-xl">New Service</h1>

            <p className="text-xs text-slate-500">
              Create a new workshop service record
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Page heading */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5 text-orange-500">
              <Wrench size={22} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              Service Details
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            Enter customer, vehicle and service information below.
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />

            <div>
              <p className="font-semibold">Service saved</p>
              <p className="mt-0.5 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Customer */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <User size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold">Customer Information</h3>
                    <p className="text-xs text-slate-500">
                      Customer contact details
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Customer Name"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Arun Kumar"
                    required
                  />

                  <Input
                    label="Phone Number"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    icon={Phone}
                    required
                  />
                </div>
              </section>

              {/* Vehicle */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-orange-50 p-2.5 text-orange-500">
                    <Bike size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold">Vehicle Information</h3>
                    <p className="text-xs text-slate-500">Bike details</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Vehicle Number"
                    name="vehicle_number"
                    value={form.vehicle_number}
                    onChange={handleChange}
                    placeholder="e.g. TN 09 AB 1234"
                    required
                  />

                  <Input
                    label="Bike Model"
                    name="bike_model"
                    value={form.bike_model}
                    onChange={handleChange}
                    placeholder="e.g. Yamaha R15"
                    required
                  />
                </div>
              </section>

              {/* Items */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-orange-50 p-2.5 text-orange-500">
                      <Wrench size={20} />
                    </div>

                    <div>
                      <h3 className="font-bold">Service Items</h3>
                      <p className="text-xs text-slate-500">
                        Parts, labour and services
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100 sm:px-4 sm:text-sm"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row"
                    >
                      <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Item / Service
                        </label>

                        <input
                          value={item.name}
                          onChange={(event) =>
                            handleItemChange(index, "name", event.target.value)
                          }
                          placeholder="e.g. Engine Oil"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>

                      <div className="sm:w-36">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Amount
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(event) =>
                              handleItemChange(
                                index,
                                "amount",
                                event.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="self-end rounded-xl p-3 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 sm:mt-6"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Summary */}
            <div>
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="font-bold">Service Summary</h3>

                <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Customer</span>
                    <span className="max-w-36 truncate font-medium">
                      {form.customer_name || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="max-w-36 truncate font-medium">
                      {form.vehicle_number || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Items</span>
                    <span className="font-medium">
                      {items.filter((item) => item.name.trim()).length}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between py-5">
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Including all service items
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-orange-500">
                    ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />

                  {saving ? "Saving Service..." : "Save Service"}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Next service will automatically be scheduled after 3 months.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-orange-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

export default NewService;
