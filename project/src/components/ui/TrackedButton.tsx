import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { trackButtonClick } from '../../lib/facebookPixel';

interface TrackedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  trackingEvent: string;
  trackingData?: Record<string, any>;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const TrackedButton = forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({
    children,
    onClick,
    trackingEvent,
    trackingData = {},
    className = '',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    ...props
  }, ref) => {
    const variantClasses = {
      primary: 'bg-pink-600 hover:bg-pink-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      outline: 'bg-transparent border border-pink-600 text-pink-600 hover:bg-pink-50'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Suivre le clic avec Meta Pixel
      trackButtonClick({
        event_name: trackingEvent,
        button_text: typeof children === 'string' ? children : '',
        ...trackingData
      });

      // Exécuter le gestionnaire onClick original s'il existe
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center rounded-md font-medium
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
          transition-colors duration-200
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TrackedButton.displayName = 'TrackedButton';

export default TrackedButton;
