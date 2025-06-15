import Link from "next/link";
import { NavigationLink } from "./types";

interface NavigationCardProps {
  link: NavigationLink;
}

export function NavigationCard({ link }: NavigationCardProps) {
  const {
    href,
    title,
    description,
    emoji,
    gradient,
    hoverGradient,
    textColor,
    height = "h-28"
  } = link;

  return (
    <Link
      href={href}
      className={`
        group relative rounded-xl border border-gray-200 hover:border-gray-300 
        transition-all duration-300 flex flex-col items-center justify-center 
        bg-gradient-to-br ${gradient} ${textColor} gap-3 ${hoverGradient} 
        hover:shadow-xl hover:-translate-y-1 font-medium p-6 ${height}
        backdrop-blur-sm
      `}
    >
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <span className="text-3xl group-hover:scale-125 transition-transform duration-300 filter drop-shadow-sm">
          {emoji}
        </span>
        
        <div className="space-y-1">
          <h3 className={`font-bold tracking-tight ${height === 'h-36' ? 'text-xl' : height === 'h-32' ? 'text-lg' : 'text-base'} 
            text-gray-900 group-hover:text-gray-800 transition-colors`}>
            {title}
          </h3>
          
          <p className={`text-sm leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors
            ${height === 'h-36' ? 'max-w-xs' : 'max-w-xs'}`}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent 
        opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
} 