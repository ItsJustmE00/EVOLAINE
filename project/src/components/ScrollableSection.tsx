import React, { forwardRef } from 'react';

interface ScrollableSectionProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  offset?: string;
}

const ScrollableSection = forwardRef<HTMLElement, ScrollableSectionProps>(
  ({ children, id, className = '', offset = '80px' }, ref) => {
    return (
      <section 
        id={id}
        ref={ref}
        style={{
          scrollMarginTop: offset,
          scrollBehavior: 'smooth'
        }}
        className={className}
      >
        {children}
      </section>
    );
  }
);

ScrollableSection.displayName = 'ScrollableSection';

export default ScrollableSection;
