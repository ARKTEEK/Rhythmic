interface PanelActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}

export function PanelActionButton({
  label,
  icon,
  onClick,
  disabled,
  className
}: PanelActionButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {icon}
      {label}
    </button>
  );
}
