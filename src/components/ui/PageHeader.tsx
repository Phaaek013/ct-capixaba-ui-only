import { HTMLAttributes, ReactNode } from 'react';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
  className = '',
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 mb-8 ${className}`}
      {...props}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-zinc-400 text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
