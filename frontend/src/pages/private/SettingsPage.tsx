import { Clock, Save, Settings } from "lucide-react";
import { useState } from "react";
import Window from "../../components/ui/Window";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow";


export default function UserSettingsPage() {
  const [settings, setSettings] = useState({
    displayName: "",
    email: "",
    newPassword: "",
    autoSync: true,
    syncInterval: 30,
    allowBackgroundSync: false
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="p-6 font-mono flex flex-col text-black h-full w-full overflow-hidden">
        <Window
          containerClassName="w-full h-full box-style-md overflow-hidden bg-[#fff5df]"
          ribbonClassName="bg-[#8cc6f3] border-b-4 border-black text-white font-extrabold"
          windowClassName="bg-[#fff9ec]"
          ribbonContent={
            <div className="flex items-center justify-between w-full px-4 py-1">
              <h2 className="text-lg text-black uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5" />
                User Settings
              </h2>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1 bg-[#f26b6b] hover:bg-[#e55d5d] box-style-md uppercase font-extrabold hover:cursor-pointer border-2 border-black"
              >
                Reset
              </button>
            </div>
          }
        >

          <div className="p-6 flex flex-col gap-6 overflow-y-auto retro-scrollbar h-full">

            {/* ACCOUNT INFORMATION */}
            <section className="p-4 bg-[#fff5df] border-2 border-black box-style-md rounded">
              <h3 className="uppercase font-extrabold text-md mb-3">Account Settings</h3>

              <div className="flex flex-col gap-4">

                <div className="flex flex-col">
                  <label className="font-bold mb-1">Display Name</label>
                  <input
                    className="px-2 py-1 bg-[#fffaf5] border-2 border-black box-style-md"
                    value={settings.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-1">Email</label>
                  <input
                    type="email"
                    className="px-2 py-1 bg-[#fffaf5] border-2 border-black box-style-md"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold mb-1">New Password</label>
                  <input
                    type="password"
                    className="px-2 py-1 bg-[#fffaf5] border-2 border-black box-style-md"
                    value={settings.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                  />
                </div>

              </div>
            </section>


            {/* SYNC SETTINGS */}
            <section className="p-4 bg-[#fff5df] border-2 border-black box-style-md rounded">
              <h3 className="uppercase font-extrabold text-md mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Sync Settings
              </h3>

              <div className="flex flex-col gap-4">

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoSync}
                    onChange={(e) => handleChange("autoSync", e.target.checked)}
                  />
                  Enable Auto Sync
                </label>

                {settings.autoSync && (
                  <div className="flex flex-col">
                    <label className="font-bold mb-1">Sync Interval (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      className="px-2 py-1 bg-[#fffaf5] border-2 border-black box-style-md"
                      value={settings.syncInterval}
                      onChange={(e) => handleChange("syncInterval", Number(e.target.value))}
                    />
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.allowBackgroundSync}
                    onChange={(e) => handleChange("allowBackgroundSync", e.target.checked)}
                  />
                  Allow Background Sync
                </label>

              </div>
            </section>


            {/* SAVE BUTTON */}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md uppercase font-extrabold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

          </div>
        </Window>
      </div>


      {/* RESET CONFIRM MODAL */}
      {showResetConfirm && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Reset Settings?"
          confirmMessage="All fields will be cleared or returned to default values."
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={() => {
            setSettings({
              displayName: "",
              email: "",
              newPassword: "",
              autoSync: true,
              syncInterval: 30,
              allowBackgroundSync: false
            });
            setShowResetConfirm(false);
          }}
        />
      )}
    </>
  );
}
