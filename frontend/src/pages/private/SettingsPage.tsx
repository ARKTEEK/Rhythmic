import { useEffect, useMemo, useState } from "react";
import { useSetTopNavActions } from "../../context/TopNavActionsContext.tsx";

const SettingsPage = () => {
  const setTopNavActions = useSetTopNavActions();
  const [selectedPlaylists] = useState<string[]>([]);

  const hasSelection = selectedPlaylists.length > 0;

  const actions = useMemo(() => [
    {
      id: "general",
      label: "General",
      onClick: () => console.log("Deleting..."),
      active: true,
    },
    {
      id: "global",
      label: "Global",
      onClick: () => console.log("Sharing..."),
      active: hasSelection,
    },
    {
      id: "notifications",
      label: "Notifications",
      onClick: () => console.log("Creating..."),
      active: hasSelection,
    },
  ], [hasSelection]);

  useEffect(() => {
    setTopNavActions(actions);
    return () => setTopNavActions([]);
  }, [actions, setTopNavActions]);

  return (
    <div className="m-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/90 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about your account</p>
            </div>
            <div className="w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer">
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;