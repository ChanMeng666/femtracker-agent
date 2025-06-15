import React from 'react';
import { PageHeader } from './PageHeader';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backLink?: string;
  backLinkText?: string;
  statusInfo?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning';
  };
  gradient?: 'pink' | 'green' | 'blue' | 'purple';
  children: React.ReactNode;
}

const gradientClasses = {
  pink: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
  green: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
  blue: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
  purple: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50'
};

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  icon,
  backLink,
  backLinkText,
  statusInfo,
  gradient = 'pink',
  children
}) => {
  return (
    <div className={`flex h-screen ${gradientClasses[gradient]}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          backLink={backLink}
          backLinkText={backLinkText}
          statusInfo={statusInfo}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 