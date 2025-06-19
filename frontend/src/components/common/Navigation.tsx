import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AppRoutes } from "../route/AppRoutes";

const navItems = AppRoutes.filter((r) => r.label && !r.publicOnly);

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const displayItems = [...navItems, ...navItems, ...navItems];

const NavigationSidebar = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const listLength = navItems.length;
  const middleStart = listLength * ITEM_HEIGHT;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      const initialScroll =
        middleStart - CONTAINER_HEIGHT / 2 + ITEM_HEIGHT / 2;
      list.scrollTo({
        top: initialScroll,
        behavior: "instant" as ScrollBehavior,
      });
    }
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const idx = navItems.findIndex((item) => item.path === location.pathname);
    const newActiveIndex = idx !== -1 ? idx : 0;
    setActiveIndex(newActiveIndex);

    const targetScroll =
      middleStart +
      newActiveIndex * ITEM_HEIGHT -
      CONTAINER_HEIGHT / 2 +
      ITEM_HEIGHT / 2;

    isProgrammaticScroll.current = true;
    list.scrollTo({ top: targetScroll, behavior: "smooth" });

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, [location]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;

    const list = listRef.current;
    if (!list) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      const scrollTop = list.scrollTop;
      const lower = middleStart * 0.5;
      const upper = middleStart * 2.5;

      if (scrollTop < lower || scrollTop > upper) {
        const normalized = middleStart + (scrollTop % middleStart);
        list.scrollTo({
          top: normalized,
          behavior: "instant" as ScrollBehavior,
        });
      }
    }, 150);
  };

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 w-40 z-30 overflow-hidden"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="h-full w-full flex flex-col items-center overflow-y-auto overflow-x-hidden scrollbar-hide snap-y snap-mandatory"
      >
        {displayItems.map((item, idx) => {
          const originalIdx = idx % listLength;
          const diff = Math.abs(originalIdx - activeIndex);
          const dist = Math.min(diff, listLength - diff);
          const opacity = 1 - Math.min(0.2 * dist, 0.8);
          const isActive = originalIdx === activeIndex;

          return (
            <NavLink
              key={`${item.path}-${Math.floor(idx / listLength)}`}
              to={item.path}
              className="snap-center w-full flex items-center justify-center transition-all duration-300"
              style={{
                height: ITEM_HEIGHT,
                flexShrink: 0,
                opacity,
              }}
            >
              <span
                className={`transition-all duration-100 ${
                  isActive
                    ? "scale-125 font-extrabold text-white"
                    : "scale-100 font-normal text-white/70 hover:text-white hover:scale-105"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationSidebar;
