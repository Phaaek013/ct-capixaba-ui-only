import { HTMLAttributes, ReactNode } from 'react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: ReactNode;
}

export default function Alert({
  variant = 'info',
  title,
  icon,
  children,
  className = '',
  ...props
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-950/50 border-blue-800 text-blue-200',
      title: 'text-blue-100',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    success: {
      container: 'bg-green-950/50 border-green-800 text-green-200',
      title: 'text-green-100',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-yellow-950/50 border-yellow-800 text-yellow-200',
      title: 'text-yellow-100',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      container: 'bg-red-950/50 border-red-800 text-red-200',
      title: 'text-red-100',
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`rounded-md border p-4 ${currentVariant.container} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {icon || currentVariant.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h5 className={`font-medium mb-1 ${currentVariant.title}`}>
              {title}
            </h5>
          )}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
