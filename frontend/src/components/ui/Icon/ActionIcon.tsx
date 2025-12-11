interface ActionIconProps {
  action?: string;
  label?: string;
}

export default function ActionIcon({ action, label }: ActionIconProps) {
  const actionColors: Record<string, string> = {
    SYNC: "bg-gradient-to-r from-green-300 to-green-200",
    DELETE_SONG: "bg-gradient-to-r from-red-300 to-red-200",
    CONVERT: "bg-gradient-to-r from-yellow-300 to-yellow-200",
    DEFAULT: "bg-gradient-to-r from-indigo-200 to-indigo-100",
  };

  const bgColor = action ? actionColors[action] || actionColors.DEFAULT : actionColors.DEFAULT;

  return (
    <div
      className={`
        flex items-center justify-center
        ${bgColor}
        box-style-sm py-1 min-w-[80px] text-black
      `}
      title={label}>
      {label && (
        <span className="truncate font-extrabold uppercase tracking-wide text-xs">
          {label}
        </span>
      )}
    </div>
  );
}
