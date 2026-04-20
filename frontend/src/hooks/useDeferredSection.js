import { useEffect, useRef, useState } from 'react';

const useDeferredSection = ({ rootMargin = '300px 0px', threshold = 0.01 } = {}) => {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(() => (
    typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined'
  ));

  useEffect(() => {
    if (shouldLoad) {
      return undefined;
    }

    const sectionNode = sectionRef.current;

    if (!sectionNode) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(sectionNode);

    return () => observer.disconnect();
  }, [rootMargin, shouldLoad, threshold]);

  return {
    sectionRef,
    shouldLoad
  };
};

export default useDeferredSection;
