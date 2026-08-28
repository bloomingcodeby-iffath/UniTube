import { useState, useEffect } from "react";

// Returns true when the browser window is narrower than `breakpoint`
// (default 768px, a common phone/tablet cutoff). Re-checks automatically
// whenever the window is resized, so rotating a phone or resizing a
// browser window updates the layout live.
export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}