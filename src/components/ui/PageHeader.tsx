import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  backLink?: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  backLink = "/dashboard", 
  rightContent 
}: PageHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={backLink}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {icon} {title}
            </h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        {rightContent && (
          <div className="flex items-center gap-3">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
} 