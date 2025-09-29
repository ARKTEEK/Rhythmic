import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
                                    value,
                                    onChange,
                                    placeholder = "Search...",
                                    className = "",
                                  }: SearchBarProps) {
  return (
    <div
      className={ `
        box-style-xs flex items-center bg-brown-50 
        text-brown-900 px-2 py-1 gap-2 ${ className }
      ` }>
      <FaSearch className="text-black text-sm"/>
      <input
        type="text"
        value={ value }
        onChange={ (e) => onChange(e.target.value) }
        placeholder={ placeholder }
        className={ `
          flex-grow bg-transparent outline-none
          text-brown-900 placeholder-brown-400
        ` }
      />
    </div>
  );
}
