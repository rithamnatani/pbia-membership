import Image from "next/image";
import { cn } from "@/lib/utils";

export function PbiaLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/pbia-oneline.svg"
      alt="Palm Beach Indian Association logo"
      width={950}
      height={350}
      priority={priority}
      className={cn("h-auto w-full", className)}
    />
  );
}
