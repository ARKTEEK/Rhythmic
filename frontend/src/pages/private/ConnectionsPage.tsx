import Window from "../../components/ui/Window.tsx";
import { FaPlus, } from "react-icons/fa";
import { OAuthProviderNames } from "../../models/Connection.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import createConnectionsQueryOptions from "../../queries/createConnectionsQueryOptions.ts";
import ErrorWindow from "../../components/ui/Window/ErrorWindow.tsx";
import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";
import { platforms } from "../../data/platforms.ts";
import { useState } from "react";
import { disconnectOAuth } from "../../services/OAuthService.ts";
import ConfirmWindow from "../../components/ui/Window/ConfirmWindow.tsx";

export default function ConnectionsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: connections = []
  } = useQuery(createConnectionsQueryOptions());


  const handleDisconnect = async () => {
    if (selectedAccountId) {
      await disconnectOAuth("google", selectedAccountId);
      setShowConfirm(false);
      setSelectedAccountId("");
      await queryClient.invalidateQueries({ queryKey: ["connections"] });
    }
  };

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

  if (isLoading) {
    return <LoadingWindow
      loadingSpeed={ 2000 }
      status={ "loading" }
      loadingMessage={ "Loading connections..." }/>;
  }

  if (isError) {
    return <ErrorWindow errorDescription={ String(error) }/>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto">
        { platformsWithAccounts.map((platform) => (
          <Window
            containerClassName={ "h-[420px] w-[380px]" }
            key={ platform.name }
            ribbonClassName={ platform.ribbonColor }
            windowClassName={ `${ platform.windowColor }` }>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={ `${ platform.color } p-3 box-style-md` }>
                  <platform.icon className="text-white text-2xl"/>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{ platform.name }</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      { platform.accounts.length }/3 accounts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4 flex-grow">
              { platform.accounts.length === 0 ? (
                <div className="rounded-lg text-center text-gray-500 italic p-3 border-2 border-dashed border-brown-800 bg-white h-full flex items-center justify-center">
                  No accounts connected
                </div>
              ) : (
                platform.accounts.map((account) => (
                  <div
                    key={ account.id }
                    className="box-style-md flex items-center justify-between p-2 border-2 border-brown-800 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-brown-900 text-md">
                          { account.username }
                        </span>
                        <span className="text-sm text-brown-700">
                          { account.email }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={ () => {
                          setSelectedAccountId(account.id);
                          setShowConfirm(true)
                        } }
                        className="box-style-md px-4 py-1 rounded-full text-sm font-bold border-2 border-brown-800 transition-all duration-200 transform bg-red-400 hover:bg-red-500 text-white hover:cursor-pointer">
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))
              ) }
            </div>

            <button
              onClick={ platform.redirect }
              disabled={ platform.accounts.length >= 3 }
              className={ `box-style-md w-full py-3 border-2 border-brown-800
                           ${ platform.ribbonColor || "bg-brown-200" }
                           transition-all duration-200 group font-bold text-brown-900 mt-auto
                           ${ platform.accounts.length >= 3 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80 hover:cursor-pointer" }` }>
              <div className="flex items-center justify-center space-x-2">
                <FaPlus className="text-brown-900"/>
                <span>Add Account</span>
              </div>
            </button>

          </Window>
        )) }
      </div>
      { showConfirm && (
        <ConfirmWindow
          onConfirm={ handleDisconnect }
          onCancel={ () => setShowConfirm(false) }
          confirmTitle={ "Are you sure?" }
          confirmMessage={ "Your account will be disconnected." }/>
      ) }
    </div>
  );

}
