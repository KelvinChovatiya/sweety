function ReportFilters({
  reportType,
  selectedDate,
  onTypeChange,
  onDateChange,
}) {
    console.log(reportType, selectedDate);
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-[#19395B]">
        Glucose Reports
      </h2>

      <div className="flex flex-wrap gap-3">
        <select
          value={reportType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-lg border p-3"
        >
          <option value="daily">Daily</option>
          <option value="month-to-date">Month to Date</option>
          <option value="previous-month">Previous Month</option>
        </select>

        {reportType === "daily" && (
          <input
            type="date"
            value={selectedDate}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border p-3"
          />
        )}
      </div>
    </section>
  );
}

export default ReportFilters;