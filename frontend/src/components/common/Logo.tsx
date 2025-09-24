interface LogoProps {
  size?: "sm" | "md" | "lg";
  underline?: boolean;
  text?: string;
}

export const Logo = ({ size = "md", underline = true, text = "Rhythmic" }: LogoProps) => {
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const underlineOffsets = {
    sm: "-bottom-1",
    md: "-bottom-2",
    lg: "-bottom-3",
  };

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <div className="relative inline-block group">
      <span
        className={ `
          font-extrabold tracking-tight
          bg-gradient-to-r from-[#FF906D] to-[#FF7A5A]
          bg-clip-text text-transparent relative z-10
          drop-shadow-[0_2px_4px_rgba(255,122,90,0.3)]
          ${ textSizes[size] }` }>
        { text }
      </span>

      { underline && (
        <div
          className={ `absolute left-0 right-0 flex justify-center space-x-1 opacity-70 ${ underlineOffsets[size] }` }>
          { [1, 2, 3].map((i) => (
            <div
              key={ i }
              className={ `rounded-full bg-gradient-to-b from-[#FF906D] to-[#FF7A5A] ${ dotSizes[size] }` }/>
          )) }
        </div>
      ) }
    </div>
  );
};
