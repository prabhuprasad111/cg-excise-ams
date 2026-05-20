import { useEffect, useState } from "react";

/** Pixel height for ApexCharts on resize (sm / md / lg breakpoints). */
export function useChartHeight(sm = 240, md = 280, lg = 320): number {
  const [height, setHeight] = useState(lg);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setHeight(sm);
      else if (w < 1024) setHeight(md);
      else setHeight(lg);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [sm, md, lg]);

  return height;
}
