export function LiveRegion() {
  return (
    <div
      id="live-region"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
} 