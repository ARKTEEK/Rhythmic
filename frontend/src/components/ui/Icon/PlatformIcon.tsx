import { FaSpotify, FaYoutube } from "react-icons/fa";
import { SiApplemusic, SiMusicbrainz, SiTidal } from "react-icons/si";
import { getProviderColors } from "../../../utils/providerUtils.tsx";

interface PlatformIconProps {
  providerName?: string;
  label?: string;
}

const providerIcons: Record<string, any> = {
  Spotify: FaSpotify,
  YouTube: FaYoutube,
  "Apple Music": SiApplemusic,
  Deezer: SiMusicbrainz,
  Tidal: SiTidal,
};

export default function PlatformIcon({
  providerName,
  label,
}: PlatformIconProps) {
  const colors = providerName
    ? getProviderColors(providerName)
    : {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };

  const Icon = providerIcons[providerName || label || ""];
  const displayLabel = label || providerName || "Unknown";
  const firstLetter = displayLabel.charAt(0).toUpperCase();

  return (
    <div
      className={`
        flex items-center justify-center gap-1
        ${colors.accentSoft}
        box-style-md py-1 px-2 ${colors.text}
        w-full sm:w-auto sm:min-w-[100px] lg:min-w-[120px]
      `}
      title={displayLabel}>
      {Icon ? (
        <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 lg:hidden" />
      ) : (
        <span className="lg:hidden font-extrabold uppercase text-sm">
          {firstLetter}
        </span>
      )}

      <span className="hidden lg:inline truncate font-extrabold uppercase tracking-wide text-xs">
        {displayLabel}
      </span>
    </div>
  );
}
