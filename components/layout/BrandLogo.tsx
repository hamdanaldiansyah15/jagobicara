import Image from "next/image";
import logoImage from "@/logo/logojagobicara.png";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className = "h-10", priority = false }: BrandLogoProps) {
  return (
    <Image
      src={logoImage}
      alt="Jago Bicara"
      priority={priority}
      className={`block w-auto max-w-full object-contain ${className}`}
    />
  );
}