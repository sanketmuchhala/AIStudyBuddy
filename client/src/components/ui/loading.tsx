import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground" aria-live="polite">
          {message}
        </p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({ title, description, className }: LoadingCardProps) {
  return (
    <div className={cn('bg-card border rounded-lg p-6', className)} role="status">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          {title && <h3 className="font-semibold">{title}</h3>}
        </div>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}