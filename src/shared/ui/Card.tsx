import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({
  accent = false,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    'card',
    accent && 'card-accent',
    interactive && 'card-interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={['card-body', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={['card-header', className].filter(Boolean).join(' ')}>{children}</div>
  );
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={['card-footer', className].filter(Boolean).join(' ')}>{children}</div>
  );
}
