interface DateFilterProps {
  dateFilter: "all" | "today" | "week" | "month";
  customDate: string;
  onDateFilterChange: (filter: "all" | "today" | "week" | "month") => void;
  onCustomDateChange: (date: string) => void;
}

export default function DateFilter({
  dateFilter,
  customDate,
  onDateFilterChange,
  onCustomDateChange,
}: DateFilterProps) {
  return (
    <div className="px-4 py-2 bg-[#fff9ec] border-b-2 border-black">
      <div className="flex items-center gap-2 text-xs">
        <select
          value={customDate ? "custom" : dateFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") return;
            onCustomDateChange("");
            onDateFilterChange(value as typeof dateFilter);
          }}
          className="flex-1 px-2 py-1 bg-white border-2 border-black box-style-sm font-bold cursor-pointer hover:bg-[#fffaf5]">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          {customDate && <option value="custom">Custom Date</option>}
        </select>
      </div>
      <div className="mt-2">
        <input
          type="date"
          value={customDate}
          onChange={(e) => {
            onCustomDateChange(e.target.value);
            if (!e.target.value) {
              onDateFilterChange("all");
            }
          }}
          className="w-full px-2 py-1 bg-white border-2 border-black box-style-sm text-xs font-bold cursor-pointer hover:bg-[#fffaf5]"
          placeholder="Select specific date"
        />
      </div>
    </div>
  );
}

