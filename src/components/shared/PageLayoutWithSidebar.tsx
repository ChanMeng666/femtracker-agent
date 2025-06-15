import React from 'react';
import { PageHeader } from './PageHeader';

interface PageLayoutWithSidebarProps {
  title: string;
  subtitle?: string;
  icon?: string;
  statusInfo?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
  };
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageLayoutWithSidebar: React.FC<PageLayoutWithSidebarProps> = ({
  title,
  subtitle,
  icon,
  statusInfo,
  rightContent,
  children,
  className = ''
}) => {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        statusInfo={statusInfo}
        rightContent={rightContent}
      />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}; 