import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaPlus, } from "react-icons/fa";
import Window from "../../components/ui/Window.tsx";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow.tsx";
import ErrorWindow from "../../components/ui/Window/ErrorWindow.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import createConnectionsQueryOptions from "../../queries/createConnectionsQueryOptions.ts";
import { disconnectOAuth } from "../../services/OAuthService.ts";
import { OAuthProviderNames, platforms } from "../../utils/providerUtils.tsx";

export default function ConnectionsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{
    id: string;
    provider: string
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: connections = []
  } = useQuery(createConnectionsQueryOptions());

  const platformsWithAccounts = platforms.map((platform) => {
    const matchedConnections = connections
      .filter((conn) => OAuthProviderNames[conn.provider] === platform.name)
      .map((conn) => ({
        id: conn.id,
        username: conn.displayname,
        email: conn.email
      }));

    return {
      ...platform,
      accounts: matchedConnections,
    };
  });

  const handleDisconnect = async () => {
    if (selectedAccount) {
      await disconnectOAuth(selectedAccount.provider, selectedAccount.id);
      setShowConfirm(false);
      setSelectedAccount(null);
      await queryClient.invalidateQueries({ queryKey: ["connections"] });
    }
  };

  if (isLoading) {
    return <LoadingWindow
      loadingSpeed={2000}
      status={"loading"}
      loadingMessage={"Loading connections..."} />;
  }

  if (isError) {
    return <ErrorWindow errorDescription={String(error)} />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8
                      max-w-7xl mx-auto">
        {platformsWithAccounts.map((platform) => (
          <Window
            containerClassName="h-auto min-h-[380px] sm:min-h-[420px] w-full md:max-w-[500px] mx-auto"
            key={platform.name}
            ribbonClassName={platform.accent}
            windowClassName={`${platform.secondaryAccent}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`${platform.color} p-2 sm:p-3 box-style-md`}>
                  <platform.icon className="text-white text-xl sm:text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{platform.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {platform.accounts.length}/3 accounts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 flex-grow">
              {platform.accounts.length === 0 ? (
                <div className="rounded-lg text-center text-gray-500 italic p-3 border-2 border-dashed
                                border-brown-800 bg-white h-full flex items-center justify-center text-xs sm:text-sm">
                  No accounts connected
                </div>
              ) : (
                platform.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="box-style-md flex flex-col sm:flex-row items-start sm:items-center
                               justify-between p-2 border-2 border-brown-800 bg-white gap-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-brown-900 text-sm sm:text-md truncate">
                          {account.username}
                        </span>
                        <span className="text-xs sm:text-sm text-brown-700 truncate">
                          {account.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setSelectedAccount({
                            provider: platform.name,
                            id: account.id
                          });
                          setShowConfirm(true)
                        }}
                        className="box-style-md px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm
                                   font-bold border-2 border-brown-800 transition-all duration-200
                                   transform bg-red-400 hover:bg-red-500 text-white hover:cursor-pointer
                                   w-full sm:w-auto">
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={platform.redirect}
              disabled={platform.accounts.length >= 3}
              className={`box-style-md w-full py-2 sm:py-3 border-2 border-brown-800
                           ${platform.accent || "bg-brown-200"}
                           transition-all duration-200 group font-bold text-brown-900 mt-auto
                           ${platform.accounts.length >= 3 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 hover:cursor-pointer"}`}>
              <div className="flex items-center justify-center space-x-2">
                <FaPlus className="text-brown-900 text-sm sm:text-base" />
                <span className="text-sm sm:text-base">Add Account</span>
              </div>
            </button>

          </Window>
        ))}
      </div>
      {showConfirm && (
        <ConfirmWindow
          onConfirm={handleDisconnect}
          onCancel={() => setShowConfirm(false)}
          confirmTitle={"Are you sure?"}
          confirmMessage={"Your account will be disconnected."} />
      )}
    </div>
  );

}
