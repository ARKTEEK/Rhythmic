import { IconType } from "react-icons";
import { ParticleBackground } from "./ParticleBackground.tsx";
import { ShimmerEffect } from "./ShimmerEffect.tsx";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  Icon?: IconType;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  variant?: 'active' | 'inactive';
}

const baseButtonClasses = `
  relative inline-flex items-center font-medium tracking-wide
  rounded-2xl transition-all duration-200 overflow-hidden group backdrop-blur-sm
  disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
`;

const variantClassesMap = {
  inactive: `
    bg-gradient-to-br from-[#f5f5f5]/70 to-[#e6e6e6]/70 text-[#6C6C6C] border border-[#ffffff]/30
    shadow-[inset_1px_1px_2px_#ffffff,inset_-1px_-1px_2px_#d9d9d9,0_4px_8px_rgba(0,0,0,0.05)]
    hover:border-[#e55f39]/50 hover:shadow-[inset_1px_1px_2px_#ffffff,inset_-1px_-1px_2px_#d9d9d9,0_6px_12px_rgba(0,0,0,0.1)]
  `,
  active: `
    bg-gradient-to-br from-[#FF906D]/90 to-[#FF7A5A]/90 text-[#141414]
    shadow-[0_6px_16px_rgba(255,122,90,0.4),inset_1px_1px_2px_#ffb198,inset_-1px_-1px_2px_#e56440]
    border border-[#e55f39]/50 font-semibold
    hover:brightness-105 hover:shadow-[0_8px_20px_rgba(255,122,90,0.5)]
  `,
};

const sizeClassesMap = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3',
  large: 'px-8 py-4 text-lg',
};

export const Button = ({
                         label,
                         onClick,
                         Icon,
                         disabled = false,
                         type = 'button',
                         size = 'medium',
                         variant = 'inactive',
                       }: ButtonProps) => {
  const variantClasses = variantClassesMap[variant];
  const iconColor = variant === 'active' ? 'text-[#141414]' : 'text-[#6C6C6C]';
  const iconSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      type={ type }
      onClick={ onClick }
      disabled={ disabled }
      className={ `${ baseButtonClasses } ${ sizeClassesMap[size] } ${ variantClasses }` }>
      <div
        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br
                   from-white/50 to-transparent p-[1px] mask-linear"/>
      <ParticleBackground active={ variant === 'active' }/>
      <ShimmerEffect active={ variant === 'active' }/>
      <div
        className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b
                   from-white/20 to-transparent rounded-t-2xl pointer-events-none"/>

      <div className="flex items-center gap-2 relative z-10">
        { Icon &&
            <Icon className={ `flex-shrink-0 ${ iconSize } ${ iconColor }` }/> }
        <span className="text-left font-medium">{ label }</span>
      </div>
    </button>
  );
};
