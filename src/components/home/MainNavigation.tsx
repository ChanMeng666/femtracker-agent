import { navigationSections } from "@/constants/navigationData";
import { NavigationSection } from "./NavigationSection";

export function MainNavigation() {
  return (
    <div className="space-y-6">
      {navigationSections.map((section) => (
        <NavigationSection key={section.title} section={section} />
      ))}
    </div>
  );
} 