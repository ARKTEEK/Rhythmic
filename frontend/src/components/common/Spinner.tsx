import { FaSpinner } from "react-icons/fa";
const Spinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full text-white">
      <FaSpinner className="animate-spin text-4xl text-red-500" />
    </div>
  );
};
export default Spinner;
