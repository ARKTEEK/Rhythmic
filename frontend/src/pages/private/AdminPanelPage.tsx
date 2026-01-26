import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import AdminActions from "../../components/admin/AdminActions";
import CreateUserModal from "../../components/admin/CreateUserModal";
import StatisticsDisplay from "../../components/admin/StatisticsDisplay";
import UserTable from "../../components/admin/UserTable";
import Window from "../../components/ui/Window";
import { useAuth } from "../../hooks/useAuth";
import { getAllUsers, getSystemStatistics } from "../../services/AdminService";

export default function AdminPanelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "statistics">("statistics");
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  if (!user?.roles?.includes("Admin")) {
    return <Navigate to="/playlists" replace />;
  }

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
    enabled: activeTab === "users",
  });

  const { data: statistics, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ["admin-statistics"],
    queryFn: getSystemStatistics,
    enabled: activeTab === "statistics",
  });

  return (
    <>
      <AdminActions
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateUser={() => setShowCreateUserModal(true)}
      />

      <div className="p-2 sm:p-4 md:p-6 font-mono flex flex-col text-black h-full w-full overflow-hidden">
        <Window
          containerClassName="w-full h-full box-style-md overflow-hidden bg-gradient-to-b from-[#fff6e7] to-[#fff3db]"
          ribbonClassName="bg-[#f26b6b] border-b-4 border-black text-white font-extrabold"
          windowClassName="bg-[#fff9ec]"
          ribbonContent={
            <div className="flex items-center justify-between w-full px-2 sm:px-4 py-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg text-white uppercase tracking-wider">
                  Admin Panel
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-normal text-white/90">
                {activeTab === "statistics" ? "System Statistics" : "User Management"}
              </span>
            </div>
          }>
          <div className="p-2 sm:p-4 flex flex-col h-full overflow-hidden">
            {activeTab === "statistics" && (
              <div className="flex-1 overflow-y-auto">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">
                    Loading statistics...
                  </div>
                ) : statsError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-red-600 font-bold mb-2">Error loading statistics</div>
                      <div className="text-sm text-gray-600">{String(statsError)}</div>
                    </div>
                  </div>
                ) : statistics ? (
                  <StatisticsDisplay statistics={statistics} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">
                    No statistics available
                  </div>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="flex-1 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">
                    Loading users...
                  </div>
                ) : (
                  <UserTable users={users} />
                )}
              </div>
            )}
          </div>
        </Window>
      </div>

      {showCreateUserModal && (
        <CreateUserModal onClose={() => setShowCreateUserModal(false)} />
      )}
    </>
  );
}

