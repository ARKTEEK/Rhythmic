import { Link } from "react-router-dom";

export const Terms = () => (
  <div className="p-4 bg-white/50 rounded-2xl border-2 border-dashed border-[#FF7A5A]/40 backdrop-blur-sm">
    <p className="text-sm text-[#6C6C6C] font-medium"> By using RHYTHMIC, you agree to our{ " " }
      <Link
        to="/terms"
        className="text-[#FF7A5A] font-black hover:underline transition-colors duration-200"> TERMS </Link>{ " " }and{ " " }
      <Link
        to="/policy"
        className="text-[#FF7A5A] font-black hover:underline transition-colors duration-200"> POLICY </Link>
    </p>
  </div>
);