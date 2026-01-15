import { Music, X } from "lucide-react";
import { useEffect, useState } from "react";
import { JobType } from "../../enums/JobType";
import { useSignalR } from "../../hooks/useSignalR";
import { Platform } from "../../models/Connection";
import { ProviderPlaylist } from "../../models/ProviderPlaylist";
import { getConnections } from "../../services/OAuthService";
import { getProviderName, getProviderValue } from "../../utils/providerUtils";

enum TransferStep {
  SelectPlatform,
  SelectAccount,
  InProgress,
  Completed,
}

interface PlaylistTransferModalProps {
  playlist: ProviderPlaylist;
  platforms: Platform[];
  onClose: () => void;
}

export function PlaylistTransferModal({
  playlist,
  platforms,
  onClose,
}: PlaylistTransferModalProps) {
  const [step, setStep] = useState<TransferStep>(TransferStep.SelectPlatform);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<number, string>>({});

  const {
    startJob,
    cancelJob,
    isRunning,
    currentTrack,
    processedTracksMap,
  } = useSignalR();

  useEffect(() => {
    getConnections().then(conns => {
      const map: Record<number, string> = {};
      conns.forEach(c => {
        map[c.provider] = c.id;
      });
      setConnections(map);
    });
  }, []);

  const processedCount = processedTracksMap[JobType.TransferPlaylist]?.length ?? 0;

  const totalTracks = playlist.itemCount;

  const progress = totalTracks === 0 ? 0 : Math.round((processedCount / totalTracks) * 100);

  const startTransfer = () => {
    if (!selectedPlatform || !selectedAccountId) return;

    startJob(JobType.TransferPlaylist, {
      sourceProvider: playlist.provider,
      sourceAccountId: playlist.providerId,
      sourcePlaylistId: playlist.id,
      destinationProvider: getProviderValue(selectedPlatform.name),
      destinationAccountId: selectedAccountId,
    });

    setStep(TransferStep.InProgress);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[600px] bg-[#fff9ec] box-style-lg">

        <div className="flex items-center justify-between px-4 py-2 border-b-4 rounded-t-lg border-black bg-[#f3d99c] font-extrabold uppercase">
          <span>Transfer Playlist</span>
          <button
            onClick={onClose}
            className="p-1 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer">
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">

          {step === TransferStep.SelectPlatform && (
            <>
              <div className="font-bold uppercase tracking-wide">
                Select destination platform
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms.map(p => {
                  const isSource = p.name === getProviderName(playlist.provider);
                  const isSelected = selectedPlatform?.name === p.name;

                  return (
                    <button
                      key={p.name}
                      disabled={isSource}
                      onClick={() => {
                        setSelectedPlatform(p);
                        setStep(TransferStep.SelectAccount);
                      }}
                      className={`
                        relative p-4 border-2 border-black box-style-md flex items-center gap-4 text-left
                        transition-all cursor-pointer
                        ${p.secondaryAccent}
                        ${isSelected ? "ring-4 ring-black" : ""}
                        ${isSource ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02] hover:bg-opacity-90"}
                        `}>
                      <div className={`${p.color} p-3 box-style-md`}>
                        <p.icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-extrabold text-lg">
                          {p.name}
                        </span>
                        {isSource && (
                          <span className="text-xs italic text-gray-700">
                            Source platform
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === TransferStep.SelectAccount && selectedPlatform && (
            <>
              <div className="font-bold uppercase tracking-wide">
                Select {selectedPlatform.name} account
              </div>

              {selectedPlatform.accounts.length === 0 ? (
                <button
                  onClick={selectedPlatform.redirect}
                  className={`
                    p-4 border-2 border-black box-style-md font-extrabold uppercase
                    ${selectedPlatform.accent}
                    hover:opacity-90 `}>
                  Connect {selectedPlatform.name} account
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedPlatform.accounts.map(acc => {
                    const isSelected = selectedAccountId === acc.id;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          console.log(acc.id);
                          setSelectedAccountId(acc.id)
                        }}
                        className={`
                          flex items-center justify-between p-3 border-2 border-black box-style-md
                          transition-all cursor-pointer
                          ${selectedPlatform.secondaryAccent}
                          ${isSelected ? "ring-4 ring-black" : "hover:bg-opacity-90"}
                          `}>
                        <div className="flex items-center gap-3">
                          <div className={`${selectedPlatform.color} p-2 box-style-md`}>
                            <selectedPlatform.icon className="w-4 h-4 text-white" />
                          </div>

                          <div className="flex flex-col text-left">
                            <span className="font-bold">{acc.username}</span>
                            <span className="text-xs text-gray-700">
                              {acc.email}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="font-extrabold uppercase text-sm">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                disabled={!selectedAccountId}
                onClick={startTransfer}
                className={`
                  mt-4 p-3 border-2 border-black box-style-md font-extrabold uppercase
                  ${selectedPlatform.accent}
                  disabled:opacity-40 hover:opacity-90 cursor-pointer
                  `}>
                Start Transfer
              </button>
            </>
          )}

          {step === TransferStep.InProgress && (
            <div className="flex flex-col items-center gap-4 text-center">

              {isRunning && (
                <div className="font-extrabold uppercase tracking-wide">
                  Transferring tracks
                </div>
              )}

              {isRunning ? (
                <>
                  {/* CURRENT TRACK */}
                  {currentTrack ? (
                    <div className="flex items-center gap-4 p-3 border-2 border-black box-style-md bg-[#fffaf0] w-full max-w-[420px]">
                      {currentTrack.thumbnailUrl ? (
                        <img
                          src={currentTrack.thumbnailUrl}
                          alt={currentTrack.title}
                          className="w-14 h-14 border-2 border-black box-style-md object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 border-2 border-black box-style-md bg-[#f3d99c] flex items-center justify-center">
                          <Music className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex flex-col text-left min-w-0">
                        <span className="font-bold truncate">
                          {currentTrack.title}
                        </span>
                        <span className="text-sm text-gray-700 truncate">
                          {currentTrack.artist}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="italic text-sm text-gray-600">
                      Preparing transfer…
                    </div>
                  )}

                  {/* PROGRESS BAR */}
                  <div className="w-full max-w-[420px]">
                    <div className="relative h-6 border-2 border-black bg-[#fffaf0] box-style-md overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#63d079] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                        {processedCount} / {totalTracks} tracks
                      </div>
                    </div>
                  </div>

                  {/* CANCEL */}
                  <button
                    onClick={cancelJob}
                    className="mt-2 px-4 py-2 bg-[#f26b6b] hover:bg-[#e55d5d]
                               border-2 border-black box-style-md font-extrabold uppercase cursor-pointer">
                    Cancel transfer
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 p-4 border-2 border-black box-style-md bg-[#e9ffe9] w-full max-w-[420px]">

                    <div className="font-extrabold uppercase">
                      Transfer complete
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-2 px-4 py-2 bg-[#63d079] hover:bg-[#4ec767]
                    border-2 border-black box-style-md font-extrabold uppercase cursor-pointer">
                    Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
