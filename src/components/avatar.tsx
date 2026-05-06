interface Props {
  name: string;
  size?: number;
  className?: string;
}

const PALETTE: Array<[string, string]> = [
  ["#dbeafe", "#1e40af"],
  ["#fef3c7", "#92400e"],
  ["#dcfce7", "#166534"],
  ["#fce7f3", "#9f1239"],
  ["#e0e7ff", "#3730a3"],
  ["#fed7aa", "#9a3412"],
];

export function Avatar({ name, size = 24, className }: Props) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const idx = name.charCodeAt(0) % PALETTE.length;
  const [bg, fg] = PALETTE[idx];
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        fontSize: Math.max(10, size * 0.4),
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
