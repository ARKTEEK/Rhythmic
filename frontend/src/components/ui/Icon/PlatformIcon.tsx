import React from "react";
import { getProviderColors } from "../../../utils/providerUtils.tsx";

interface PlatformIconProps {
  providerName?: string;
  label?: string;
}

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

  return (
    <div
      className={ `
        flex items-center justify-center
        ${ colors.accentSoft }
        box-style-md py-1 ${ colors.text } min-w-[80px]
      ` }
      title={ label || providerName }>
      { label && (
        <span className="truncate font-extrabold uppercase tracking-wide text-xs">
          { label }
        </span>
      ) }
    </div>
  );
}
