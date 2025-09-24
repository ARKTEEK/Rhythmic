export const ShimmerEffect = ({ active }: { active: boolean }) => (
  <div
    className={ `
      absolute inset-0 rounded-2xl overflow-hidden pointer-events-none
      ${ active ? 'opacity-40' : 'opacity-20' }
    ` }>
    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer"/>
  </div>
);
