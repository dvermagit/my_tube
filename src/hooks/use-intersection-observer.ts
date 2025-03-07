import { useEffect, useState, useRef } from "react";

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, SetIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      SetIsIntersecting(entry.isIntersecting);
    }, options);
    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget); // Stop observing the target element
      }
      observer.disconnect(); // Disconnect the observer
    };
  }, [options]); // Re-run effect if `options` changes

  return { targetRef, isIntersecting }; // Return both values
  // return () => observer.disconnect();
};
