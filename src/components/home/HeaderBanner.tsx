import Image from "next/image";

export function HeaderBanner() {
  return (
    <div className="w-full">
      <Image
        className="dark:invert w-full h-auto"
        src="/chan-meng-banner.svg"
        alt="chan meng banner"
        width={1000}
        height={100}
        priority
      />
    </div>
  );
} 