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
    borderColor = "border border-gray-200",
    height = "h-28"
  } = link;

  return (
    <Link
      href={href}
      className={`
        group rounded-xl ${borderColor} transition-all flex flex-col items-center justify-center 
        bg-gradient-to-br ${gradient} ${textColor} gap-3 ${hoverGradient} hover:shadow-lg 
        font-medium p-6 ${height}
      `}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">
        {emoji}
      </span>
      <span className={`font-semibold ${height === 'h-32' ? 'text-lg' : 'text-base'}`}>
        {title}
      </span>
      <span className="text-xs text-center text-gray-600">
        {description}
      </span>
    </Link>
  );
} 