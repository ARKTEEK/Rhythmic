import { useEffect, useMemo } from "react";
import { BarChart3, Users, UserPlus } from "lucide-react";
import { useSetTopNavActions } from "../../context/TopNavActionsContext.tsx";

interface AdminActionsProps {
  activeTab: "users" | "statistics";
  onTabChange: (tab: "users" | "statistics") => void;
  onCreateUser: () => void;
}

export default function AdminActions({
  activeTab,
  onTabChange,
  onCreateUser
}: AdminActionsProps) {
  const setTopNavActions = useSetTopNavActions();

  const actions = useMemo(() => [
    {
      id: "statistics",
      label: "Statistics",
      onClick: () => onTabChange("statistics"),
      active: activeTab === "statistics",
      Icon: BarChart3 as any,
      labelClassName: "hidden sm:inline",
      buttonClassName: activeTab === "statistics"
        ? "bg-[#f3d99c] border-2 border-black"
        : "bg-white border-2 border-black hover:bg-gray-100",
      textClassName: "text-black",
    },
    {
      id: "users",
      label: "Users",
      onClick: () => onTabChange("users"),
      active: activeTab === "users",
      Icon: Users as any,
      labelClassName: "hidden sm:inline",
      buttonClassName: activeTab === "users"
        ? "bg-[#f3d99c] border-2 border-black"
        : "bg-white border-2 border-black hover:bg-gray-100",
      textClassName: "text-black",
    },
    ...(activeTab === "users" ? [{
      id: "create-user",
      label: "Create User",
      onClick: onCreateUser,
      active: true,
      Icon: UserPlus as any,
      labelClassName: "hidden sm:inline",
      buttonClassName: "bg-[#63d079] border-2 border-black hover:bg-[#4ec767]",
      textClassName: "text-black",
    }] : []),
  ], [activeTab, onTabChange, onCreateUser]);

  useEffect(() => {
    setTopNavActions(actions);
  }, [actions, setTopNavActions]);

  return null;
}

