import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  Icon?: IconType;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  variant?: 'active' | 'inactive';
}

const baseButtonStyles = `
  box-style-md relative inline-flex items-center font-bold tracking-wide
  transition-all duration-200 overflow-hidden group
  disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
  hover:translate-x-[-1px] hover:translate-y-[-1px]
  active:translate-x-[1px] active:translate-y-[1px]
`;

const variantButtonStyles = {
  inactive: `
    bg-white text-gray-800 hover:from-blue-50 hover:to-purple-50
  `,
  active: `
    bg-[#f9ccb5] text-black border-2 border-black
  `,
};

const sizeStyles = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
};

export default function Button({
                                 label,
                                 onClick,
                                 Icon,
                                 disabled = false,
                                 type = 'button',
                                 size = 'medium',
                                 variant = 'inactive',
                               }: ButtonProps) {
  const variantClasses = variantButtonStyles[variant];
  const iconColor = variant === 'active' ? 'text-black' : 'text-gray-700';
  const iconSize = size === 'small' ? 'h-4 w-4' : size === 'medium' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <button
      type={ type }
      onClick={ onClick }
      disabled={ disabled }
      className={ `${ baseButtonStyles } ${ sizeStyles[size] } ${ variantClasses }` }>

      <div className="flex items-center gap-2 relative z-10">
        { Icon &&
            <Icon className={ `flex-shrink-0 ${ iconSize } ${ iconColor }` }/> }
        <span className="text-left font-bold drop-shadow-sm">{ label }</span>
      </div>
    </button>
  );
};
