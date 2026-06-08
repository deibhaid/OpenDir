import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:opacity-90',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        size === 'default' && 'h-9 px-3 py-2',
        size === 'sm' && 'h-8 px-2.5 text-xs',
        size === 'icon' && 'h-9 w-9',
        className,
      )}
      {...props}
    />
  );
}
