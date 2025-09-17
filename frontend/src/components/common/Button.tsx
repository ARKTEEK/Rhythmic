import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  Icon?: IconType;
  fullWidth?: boolean;
  small?: boolean;
}

const baseButtonClasses = `
  relative inline-block font-medium tracking-wide
  rounded-2xl transition-all duration-150
  flex flex-row items-center
  hover:cursor-pointer
  overflow-hidden
  group
  backdrop-blur-sm
`;

const inactiveClasses = `
  bg-gradient-to-br from-[#f5f5f5]/70 to-[#e6e6e6]/70 text-[#6C6C6C]
  border border-[#ffffff]/30
  shadow-[inset_1px_1px_2px_#ffffff,inset_-1px_-1px_2px_#d9d9d9,0_4px_8px_rgba(0,0,0,0.05)]
  hover:border-[#e55f39]/50
`;

const activeClasses = `
  bg-gradient-to-br from-[#FF906D]/90 to-[#FF7A5A]/90 text-[#141414]
  shadow-[0_4px_12px_rgba(255,122,90,0.3),inset_1px_1px_2px_#ffb198,inset_-1px_-1px_2px_#e56440]
  border border-[#e55f39]/50
  font-semibold
  hover:brightness-105
  hover:scale-[1.01]
`;

const ParticleBackground = ({ active }: { active: boolean }) => {
  const particles = [
    { x: 15, y: 25, size: 1.5 },
    { x: 35, y: 60, size: 2 },
    { x: 75, y: 30, size: 1 },
    { x: 55, y: 80, size: 1.8 },
    { x: 85, y: 65, size: 1.2 },
    { x: 25, y: 45, size: 2.2 },
    { x: 65, y: 15, size: 1.7 },
    { x: 45, y: 35, size: 1.3 },
    { x: 10, y: 70, size: 1.9 },
    { x: 90, y: 40, size: 1.4 },
    { x: 30, y: 10, size: 2.1 },
    { x: 70, y: 85, size: 1.6 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      { particles.map((particle, index) => (
        <div
          key={ index }
          className={ `absolute rounded-full ${ active ? 'bg-white/50' : 'bg-[#6C6C6C]/20' }` }
          style={ {
            left: `${ particle.x }%`,
            top: `${ particle.y }%`,
            width: `${ particle.size }px`,
            height: `${ particle.size }px`,
          } }/>
      )) }
    </div>
  );
};

const ShimmerEffect = ({ active }: { active: boolean }) => (
  <div
    className={ `
      absolute inset-0 rounded-2xl overflow-hidden pointer-events-none
      ${ active ? 'opacity-40' : 'opacity-20' }
    ` }>
    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer"/>
  </div>
);

export const Button = ({
                         label,
                         active = false,
                         onClick,
                         Icon,
                         fullWidth,
                         small,
                       }: ButtonProps) => {
  const widthClass = fullWidth ? "w-full" : "w-fit";
  const paddingX = small ? "px-4" : "px-5";
  const paddingY = small ? "py-1" : "py-2";
  const iconSizeClass = small ? "h-4 w-4" : "h-5 w-5";
  const iconColorClass = active ? "text-[#141414]" : "text-[#6C6C6C]";

  return (
    <button
      onClick={ onClick }
      type="button"
      className={ `
        ${ baseButtonClasses }
        ${ widthClass }
        ${ paddingX }
        ${ paddingY }
        ${ active ? activeClasses : inactiveClasses }
        transition-all duration-200 ease-in-out
      ` }>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/50 to-transparent p-[1px] mask-linear"></div>

      <ParticleBackground active={ active }/>
      <ShimmerEffect active={ active }/>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none"></div>

      <div className="flex items-center gap-2 relative z-10">
        { Icon && (
          <Icon
            className={ `
              flex-shrink-0
              ${ iconSizeClass } ${ iconColorClass }
              transition-transform duration-200
           ` }/>
        ) }
        <span className="text-left">{ label }</span>
      </div>
    </button>
  );
};