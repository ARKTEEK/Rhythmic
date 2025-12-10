import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  autoFocus,
  placeholder = "Search...",
  className
}: SearchBarProps) {
  return (
    <div className={`relative w-full ${className || ""}`}>
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-8 py-1.5 text-sm border-2 border-black box-style-sm bg-white focus:outline-none"
      />
    </div>
  );
}
