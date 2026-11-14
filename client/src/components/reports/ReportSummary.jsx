function ReportSummary({ report, loading, error }) {
  if (loading) {
    return <p className="mt-6">Loading report...</p>;
  }

  if (error) {
    return <p className="mt-6 text-red-600">{error}</p>;
  }

  const summary = report?.summary;

  if (!summary) {
    return <p className="mt-6">No report data available.</p>;
  }

  const items = [
    { label: "Highest", value: summary.highest },
    { label: "Lowest", value: summary.lowest },
    { label: "Average", value: summary.average },
    { label: "Total Readings", value: summary.count },
  ];

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">{item.label}</p>
          <h3 className="mt-2 text-2xl font-bold text-[#19395B]">
            {item.value ?? 0}
            {item.label !== "Total Readings" ? " mg/dL" : ""}
          </h3>
        </div>
      ))}
    </section>
  );
}

export default ReportSummary;