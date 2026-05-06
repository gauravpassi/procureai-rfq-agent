/**
 * ConnectorIcon — 16×16 branded SVG glyphs for each system connector.
 * Abstract enough to avoid trademark issues; visually distinct per source.
 */

import type { SignalSource } from "@/types/intake";

interface Props {
  kind: SignalSource | "email" | "gmail";
  size?: number;
}

const COLORS: Record<string, string> = {
  outlook:    "#0078d4",
  gmail:      "#ea4335",
  email:      "#3b82f6",
  sap:        "#0a6fd1",
  salesforce: "#00a1e0",
  coupa:      "#e3001a",
  slack:      "#4a154b",
  drive:      "#1fa463",
  teams:      "#5059c9",
};

function InnerGlyph({ kind }: { kind: string }) {
  switch (kind) {
    case "sap":
      return <text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">SAP</text>;
    case "salesforce":
      return <path d="M5 9 a2.5 2.5 0 1 1 1.2 -4.6 a3 3 0 0 1 5.5 0.6 a2 2 0 0 1 -1 3.8 H5.5 Z" fill="#fff" />;
    case "coupa":
      return <text x="8" y="11" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">C</text>;
    case "slack":
      return (
        <g fill="#fff">
          <rect x="6.5" y="2.5" width="3" height="11" rx="1.5" />
          <rect x="2.5" y="6.5" width="11" height="3" rx="1.5" />
        </g>
      );
    case "drive":
      return <path d="M5 3 H11 L14 9 L11 14 H5 L2 9 Z" fill="#fff" />;
    case "teams":
      return <text x="8" y="11" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">T</text>;
    case "outlook":
      return <text x="8" y="11" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">O</text>;
    case "gmail":
      return <path d="M2 4 L8 9 L14 4 V12 H2 Z" fill="#fff" />;
    case "email":
    default:
      return (
        <g>
          <rect x="2" y="4" width="12" height="8" fill="#fff" />
          <polyline points="2 4 8 9 14 4" stroke={COLORS[kind] ?? "#3b82f6"} fill="none" strokeWidth="1.5" />
        </g>
      );
  }
}

export function ConnectorIcon({ kind, size = 16 }: Props) {
  const fill = COLORS[kind] ?? "#56564f";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <rect width="16" height="16" rx="3.5" fill={fill} />
      <InnerGlyph kind={kind} />
    </svg>
  );
}
