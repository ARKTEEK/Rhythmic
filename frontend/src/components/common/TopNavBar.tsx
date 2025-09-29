import { FaEllipsisV } from "react-icons/fa";
import Button from "../ui/Button.tsx";
import { useAuth } from "../../hooks/useAuth.tsx";

interface TopNavBarProps {
  actions: {
    id: string;
    label: string;
    onClick: () => void;
    active?: boolean;
  }[];
}

export default function TopNavBar({ actions }: TopNavBarProps) {
  const { user } = useAuth();
  return (
    <div
      className="flex justify-between items-center h-[64px] px-6 border-b-4 border-black
                 bg-[#e0b39c] relative">
      <div className="bg-stripes absolute inset-0"/>

      <div className="flex flex-wrap gap-2 relative z-10">
        { actions.map((action) => (
          <Button
            key={ action.id }
            label={ action.label }
            variant={ action.active === true ? 'active' : 'inactive' }
            onClick={ action.onClick }
            size="small"
          />
        )) }
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <img
            src={ `https://ui-avatars.com/api/?name=${ user?.username }&background=0D8ABC&color=fff` }
            alt="User"
            className="w-8 h-8 rounded-lg object-cover shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2"/>
          <span className="text-md font-semibold text-black">{ user?.username }</span>
        </div>
        <FaEllipsisV className="text-black cursor-pointer"/>
      </div>

    </div>
  );
};
