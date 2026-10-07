import Image from "next/image";

export function WelixAvatar({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/welix-golfer.png"
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      sizes="96px"
      className={`object-contain ${className}`}
    />
  );
}
