export interface NavigationLink {
  href: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  hoverGradient: string;
  textColor: string;
  borderColor?: string;
  height?: string;
}

export interface NavigationSection {
  title: string;
  emoji: string;
  links: NavigationLink[];
  gridCols: string;
} 