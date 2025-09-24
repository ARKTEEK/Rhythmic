import { FaEllipsisV } from "react-icons/fa";
import { Button } from "./button/Button.tsx";

interface TopNavBarProps {
  actions: {
    id: string;
    label: string;
    onClick: () => void;
    active?: boolean;
  }[];
}

export const TopNavBar = ({ actions }: TopNavBarProps) => {
  return (
    <div className="flex justify-between items-center h-[72px] pt-8 px-6 rounded-md mb-4">
      <div className="flex flex-wrap gap-3">
        { actions.map((action) => (
          <Button
            key={ action.id }
            label={ action.label }
            variant={ action.active === true ? 'active' : 'inactive' }
            onClick={ action.onClick }
            size="small"/>
        )) }
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
            alt="User"
            className="w-8 h-8 rounded-full object-cover"/>
          <span className="text-sm font-semibold text-black">Username</span>
        </div>
        <FaEllipsisV className="text-black cursor-pointer"/>
      </div>
    </div>
  );
};
