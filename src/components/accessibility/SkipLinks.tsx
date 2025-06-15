export function SkipLinks() {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        onFocus={(e) => e.currentTarget.classList.add('focused')}
        onBlur={(e) => e.currentTarget.classList.remove('focused')}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link" 
        onFocus={(e) => e.currentTarget.classList.add('focused')}
        onBlur={(e) => e.currentTarget.classList.remove('focused')}
      >
        Skip to navigation menu
      </a>
    </div>
  );
} 