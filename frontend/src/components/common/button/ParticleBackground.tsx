export const ParticleBackground = ({ active }: { active: boolean }) => {
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
          className={ `absolute rounded-full transition-opacity duration-300 ${
            active ? 'bg-white/50' : 'bg-[#6C6C6C]/20'
          }` }
          style={ {
            left: `${ particle.x }%`,
            top: `${ particle.y }%`,
            width: `${ particle.size }px`,
            height: `${ particle.size }px`,
          } }
        />
      )) }
    </div>
  );
};
