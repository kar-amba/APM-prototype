import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon ?? <Inbox size={26} />}</div>
      <h5 className="empty-state-title">{title}</h5>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <div className="flex gap-2 justify-center mt-6">{action}</div>
      )}
    </div>
  );
}
