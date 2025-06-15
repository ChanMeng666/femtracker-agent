import React from 'react';
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backLink?: string;
  backLinkText?: string;
  statusInfo?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning';
  };
}

const statusVariants = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800'
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  backLink = "/dashboard",
  backLinkText = "← Dashboard",
  statusInfo
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={backLink}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {backLinkText}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {icon && <span>{icon}</span>}
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        {statusInfo && (
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusVariants[statusInfo.variant]}`}>
              {statusInfo.text}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}; 