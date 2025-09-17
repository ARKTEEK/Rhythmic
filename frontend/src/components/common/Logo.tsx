export const Logo = () => {
  return (
    <div className="relative inline-block group">
      <span
        className="
        text-3xl font-extrabold tracking-tight
        bg-gradient-to-r from-[#FF906D] to-[#FF7A5A]
        bg-clip-text text-transparent
        relative z-10
        drop-shadow-[0_2px_4px_rgba(255,122,90,0.3)]">
        Rhythmic
      </span>

      <div className="absolute -bottom-2 left-0 right-0 flex justify-center space-x-1 opacity-70">
        { [1, 2, 3].map((i) => (
          <div
            key={ i }
            className="w-1 h-1 rounded-full bg-gradient-to-b from-[#FF906D] to-[#FF7A5A]"
          />
        )) }
      </div>

    </div>
  );
};

<div className="px-6 pb-4 pt-4">
  <Logo/>
</div>
