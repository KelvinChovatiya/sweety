import { useEffect, useState } from "react";
import api from "../services/api";
import ReportFilters from "../components/reports/ReportFilters";
import ReportSummary from "../components/reports/ReportSummary";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [readings, setReadings] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [reportType, setReportType] = useState("daily");

  const [selectedDate, setSelectedDate] = useState(
  new Date().toLocaleDateString("en-CA")
);



  const [form, setForm] = useState({
    reading_date: new Date().toLocaleDateString("en-CA"),
    slot: "morning_fasting",
    glucose_level: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

const fetchReport = async (type, date) => {
  setLoading(true);
  setError("");

  try {
    let response;

    if (type === "daily") {
      response = await api.get("/reports/daily", {
        params: { date },
      });
    } else if (type === "month-to-date") {
      response = await api.get("/reports/month-to-date");
    } else {
      response = await api.get("/reports/previous-month");
    }

    setReport(response.data);
  } catch (error) {
    setError(
      error.response?.data?.message || "Could not load report."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(async () => {
     fetchReport("daily", selectedDate);

    const readingsResponse = await api.get("/readings");

    setReadings(
      Array.isArray(readingsResponse.data)
        ? readingsResponse.data
        : readingsResponse.data.readings || [],
    );

    fetchReport();
  }, []);

  const handleAddReading = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        ...form,
        glucose_level: Number(form.glucose_level),
      };

      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
      } else {
        await api.post("/readings", payload);
      }

      const today = new Date().toLocaleDateString("en-CA");

      const [reportResponse, readingsResponse] = await Promise.all([
        api.get("/reports/daily", { params: { date: today } }),
        api.get("/readings"),
      ]);

      setReport(reportResponse.data);

      setReadings(
        Array.isArray(readingsResponse.data)
          ? readingsResponse.data
          : readingsResponse.data.readings || [],
      );

      setEditingId(null);

      setForm({
        reading_date: new Date().toLocaleDateString("en-CA"),
        slot: "morning_fasting",
        glucose_level: "",
      });
    } catch (error) {
      setFormError(error.response?.data?.message || "Could not save reading.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (reading) => {
    setEditingId(reading.id);

    setForm({
      reading_date: reading.reading_date.slice(0, 10),
      slot: reading.slot,
      glucose_level: String(reading.glucose_level),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteReading = async (id) => {
    const confirmed = window.confirm("Delete this reading?");

    if (!confirmed) return;

    try {
      await api.delete(`/readings/${id}`);

      setReadings((prev) => prev.filter((reading) => reading.id !== id));

      // Refresh today's report
      const today = new Date().toLocaleDateString("en-CA");
      const response = await api.get("/reports/daily", {
        params: { date: today },
      });

      setReport(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Could not delete reading.");
    }
  };
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-2xl font-bold text-[#19395B]">
        Welcome, {user.name}
      </h1>

      <p className="mt-2 text-slate-600">Your blood glucose dashboard</p>

      {loading && <p>Loading report...</p>}



      {error && <p className="text-red-600">{error}</p>}

   <ReportFilters
   reportType={reportType}
  selectedDate={selectedDate}
  onTypeChange={(type) => {
    setReportType(type);
    fetchReport(type);
  }}
  onDateChange={(date) => {
    setSelectedDate(date);
    fetchReport("daily", date);
  }}
   />

   <ReportSummary
  report={report}
  loading={loading}
  error={error}
/>


     

        {/* //add readings */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-[#19395B]">
         {editingId ? "Edit Glucose Reading" : "Add Glucose Reading"}
        </h2>

            

        <form onSubmit={handleAddReading} className="grid gap-4 md:grid-cols-3">
          <input
            type="date"
            value={form.reading_date}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setForm({ ...form, reading_date: e.target.value })}
            required
            className="rounded-lg border p-3"
          />

          <select
            value={form.slot}
            onChange={(e) => setForm({ ...form, slot: e.target.value })}
            className="rounded-lg border p-3"
          >
            <option value="morning_fasting">Morning fasting</option>
            <option value="after_breakfast">After breakfast</option>
            <option value="after_lunch">After lunch</option>
            <option value="after_dinner">After dinner</option>
          </select>

          <input
            type="number"
            min="40"
            max="600"
            step="1"
            placeholder="Glucose (40–600 mg/dL)"
            value={form.glucose_level}
            onChange={(e) =>
              setForm({ ...form, glucose_level: e.target.value })
            }
            required
            className="rounded-lg border p-3"
          />

          <div className="md:col-span-3">
            {formError && (
              <p className="mb-3 text-sm text-red-600">{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#19395B] px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Reading"
                  : "Save Reading"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    reading_date: new Date().toLocaleDateString("en-CA"),
                    slot: "morning_fasting",
                    glucose_level: "",
                  });
                  setFormError("");
                }}
                className="ml-3 rounded-lg border px-6 py-3"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* //readings */}
      <section className="mt-8 bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#19395B]">Recent Readings</h2>
        </div>

        {readings.length === 0 ? (
          <p className="text-slate-500">No readings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Date</th>
                  <th className="p-3">Slot</th>
                  <th className="p-3">Glucose (mg/dL)</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id} className="border-b">
                    <td className="p-3">{reading.reading_date}</td>
                    <td className="p-3">{reading.slot.replaceAll("_", " ")}</td>
                    <td className="p-3 font-semibold">
                      {reading.glucose_level}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEditClick(reading)}
                        className="mr-3 text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteReading(reading.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
