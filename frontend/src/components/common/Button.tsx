import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  Icon?: IconType;
  disabled?: boolean;
  shimmer?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  variant?: 'active' | 'inactive';
}

const baseButtonClasses = `
  relative inline-flex items-center font-bold tracking-wide
  rounded-lg transition-all duration-200 overflow-hidden group
  disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
  border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]
  hover:translate-x-[-1px] hover:translate-y-[-1px]
  active:translate-x-[1px] active:translate-y-[1px]
`;

const variantClassesMap = {
  inactive: `
    bg-gradient-to-br from-white to-gray-100 text-gray-800
    hover:from-blue-50 hover:to-purple-50
  `,
  active: `
    bg-[#ede0d0] text-black
    border-2 border-black
  `,
};

const sizeClassesMap = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
};

export const Button = ({
                         label,
                         onClick,
                         Icon,
                         disabled = false,
                         shimmer = true,
                         type = 'button',
                         size = 'medium',
                         variant = 'inactive',
                       }: ButtonProps) => {
  const variantClasses = variantClassesMap[variant];
  const iconColor = variant === 'active' ? 'text-black' : 'text-gray-700';
  const iconSize = size === 'small' ? 'h-4 w-4' : size === 'medium' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseButtonClasses} ${sizeClassesMap[size]} ${variantClasses}`}>

      {variant === 'active' && shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}

      <div className="flex items-center gap-2 relative z-10">
        {Icon &&
            <Icon className={`flex-shrink-0 ${iconSize} ${iconColor}`} />}
        <span className="text-left font-bold drop-shadow-sm">{label}</span>
      </div>
    </button>
  );
};
