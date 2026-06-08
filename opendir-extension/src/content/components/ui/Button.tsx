import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'toolbar' | 'toolbarActive';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'outline' && 'cursor-pointer border border-input bg-background hover:bg-muted/60',
        variant === 'ghost' && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
        variant === 'toolbar' &&
          'cursor-pointer border border-input bg-background text-foreground shadow-sm hover:bg-muted/60',
        variant === 'toolbarActive' &&
          'cursor-pointer border border-foreground bg-foreground text-background shadow-sm hover:opacity-90',
        size === 'default' && 'h-9 px-3 py-2',
        size === 'sm' && 'h-8 px-2.5 text-xs',
        size === 'icon' && 'h-9 w-9 rounded-md',
        className,
      )}
      {...props}
    />
  );
});
