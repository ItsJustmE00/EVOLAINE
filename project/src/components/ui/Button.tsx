import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

// Types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragExit'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: 'full' | 'lg' | 'md' | 'none';
  hoverEffect?: 'scale' | 'lift' | 'shadow' | 'none';
  animation?: 'pulse' | 'bounce' | 'none';
}

// Animation de survol
const buttonHover = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 }
} as const;

// Composant Button principal
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    rounded = 'md',
    hoverEffect = 'scale',
    animation = 'none',
    className = '',
    ...props
  }, ref) => {
    // Styles de base
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
    
    // Variantes de style
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
      secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 focus-visible:ring-secondary-300',
      outline: 'border-2 border-primary-500 bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-200',
      ghost: 'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-200',
      link: 'text-primary-600 hover:underline underline-offset-4 focus-visible:ring-primary-200',
      gold: 'bg-gradient-to-r from-gold-500 to-amber-500 text-white hover:from-gold-600 hover:to-amber-600 focus-visible:ring-gold-200',
    };

    // Tailles
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    // Coins arrondis
    const roundness = {
      full: 'rounded-full',
      lg: 'rounded-xl',
      md: 'rounded-lg',
      none: 'rounded',
    };

    // Effets de survol
    const hoverEffects = {
      scale: 'hover:scale-105',
      lift: 'hover:-translate-y-0.5',
      shadow: 'hover:shadow-lg',
      none: '',
    };

    // Classes d'animation
    const animations: Record<string, string> = {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      ping: 'animate-ping',
      spin: 'animate-spin',
    } as const;

    // Contenu du bouton avec gestion du chargement
    const buttonContent = (
      <span className="flex items-center justify-center gap-2">
        {isLoading && (
          <motion.span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        <span>{isLoading ? 'Chargement...' : children as ReactNode}</span>
      </span>
    );

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          roundness[rounded],
          hoverEffects[hoverEffect],
          animations[animation],
          fullWidth && 'w-full',
          'relative overflow-hidden group',
          className
        )}
        disabled={disabled || isLoading}
        variants={buttonHover}
        whileHover="hover"
        whileTap="tap"
        animate={animation === 'pulse' ? 'animate' : 'initial'}
        {...(props as any)}
      >
        {/* Effet de brillance au survol */}
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full" />
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

// Composants prédéfinis pour une utilisation rapide
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);

export const GoldButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button 
    variant="gold" 
    hoverEffect="lift"
    className="font-semibold shadow-lg hover:shadow-gold-500/25"
    {...props} 
  />
);

export const FloatingActionButton = ({
  icon,
  className = '',
  ...props
}: Omit<ButtonProps, 'children'> & { icon: React.ReactNode }) => (
  <motion.div
    className={`fixed bottom-8 right-8 z-50 ${className}`}
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
  >
    <Button
      variant="primary"
      size="lg"
      className="rounded-full w-16 h-16 p-0 shadow-xl hover:shadow-2xl"
      {...props}
    >
      <span className="text-2xl">{icon}</span>
    </Button>
  </motion.div>
);
