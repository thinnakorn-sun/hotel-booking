import * as React from 'react';
import { MOBILE_BREAKPOINT_PX } from '@/lib/constants/breakpoints';

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const maxWidth = MOBILE_BREAKPOINT_PX - 1;
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
