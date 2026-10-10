import Image from "next/image";

export type WelixPose = "idle" | "walk" | "swing";

const poseImages: Record<WelixPose, string> = {
  idle: "/welix-golfer.png",
  walk: "/welix-walk.png",
  swing: "/welix-swing.png",
};

export function WelixAvatar({ className = "", pose = "idle" }: { className?: string; pose?: WelixPose }) {
  return (
    <Image
      src={poseImages[pose]}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      sizes="96px"
      className={`object-contain ${className}`}
    />
  );
}
