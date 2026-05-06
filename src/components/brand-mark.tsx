import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 28, className }: Props) {
  // Logo is ~3.92:1 aspect; derive width from height
  const width = Math.round(size * 3.92);
  return (
    <Image
      src="/brand/upcore-logo-light.png"
      alt="Upcore"
      width={width}
      height={size}
      priority
      className={className}
      style={{ height: size, width: "auto" }}
    />
  );
}
