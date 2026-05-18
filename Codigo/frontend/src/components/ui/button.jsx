import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        outline:   'border-2 border-current bg-transparent',
        ghost:     'hover:bg-accent hover:text-accent-foreground',
        link:      'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2 rounded-2xl text-base',
        sm:      'h-9  px-4 py-1 rounded-xl  text-sm',
        lg:      'h-14 px-8 py-3 rounded-3xl text-lg',
        icon:    'h-10 w-10 rounded-2xl',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
