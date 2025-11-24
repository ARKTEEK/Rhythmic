export default function Spinner() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-16 h-16">
        <div className="w-3 h-3 bg-black animate-cube-snake-1"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-2"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-3"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-8"></div>
        <div></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-4"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-7"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-6"></div>
        <div className="w-3 h-3 bg-black animate-cube-snake-5"></div>
      </div>
    </div>
  );
}
