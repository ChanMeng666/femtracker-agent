import { NavigationSection as NavigationSectionType } from "./types";
import { NavigationCard } from "./NavigationCard";

interface NavigationSectionProps {
  section: NavigationSectionType;
}

export function NavigationSection({ section }: NavigationSectionProps) {
  const { title, emoji, links, gridCols } = section;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          {title}
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
      </div>
      
      <div className={`grid ${gridCols} gap-6`}>
        {links.map((link) => (
          <NavigationCard key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
} 