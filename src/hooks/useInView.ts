import { useEffect, useState } from 'react';

interface UseInViewOptions {
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useInView = (
  ref: React.RefObject<Element>,
  options: UseInViewOptions = {}
) => {
  const [isInView, setIsInView] = useState(false);
  const { once = false, threshold = 0.1, rootMargin = '0px' } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, once, threshold, rootMargin]);

  return isInView;
};