'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up';
  duration?: number;
  delay?: number;
  className?: string;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  duration = 800,
  delay = 0,
  className = '',
  threshold = 0.05,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before it fully rolls in
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const getAnimationStyles = () => {
    switch (animation) {
      case 'fade-up':
        return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';
      case 'fade-in':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'fade-left':
        return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12';
      case 'fade-right':
        return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12';
      case 'scale-up':
        return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
      default:
        return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';
    }
  };

  const style = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'transition-all ease-out will-change-[transform,opacity]',
        getAnimationStyles(),
        className
      )}
    >
      {children}
    </div>
  );
}