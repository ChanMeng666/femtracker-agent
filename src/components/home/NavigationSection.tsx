import { NavigationSection as NavigationSectionType } from "./types";
import { NavigationCard } from "./NavigationCard";

interface NavigationSectionProps {
  section: NavigationSectionType;
}

export function NavigationSection({ section }: NavigationSectionProps) {
  const { title, emoji, links, gridCols } = section;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {emoji} {title}
      </h2>
      <div className={`grid ${gridCols} gap-4`}>
        {links.map((link) => (
          <NavigationCard key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
} 