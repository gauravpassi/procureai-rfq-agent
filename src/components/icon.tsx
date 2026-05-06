/**
 * Icon — 16px stroke=1.5 inline SVGs ported from shared.jsx.
 * Lucide is an acceptable substitute per the design handoff README,
 * but we keep these in-house so visual fidelity matches the prototypes
 * exactly. Names match the original prototype keys.
 */
import type { SVGProps } from "react";

export type IconName =
  | "check" | "x" | "arrowRight" | "arrowLeft" | "chevronDown" | "chevronRight"
  | "info" | "warn" | "clock" | "sparkle" | "package" | "file" | "paperclip"
  | "user" | "building" | "bell" | "search" | "plus" | "sliders" | "truck"
  | "calendar" | "rupee" | "spark" | "moreH" | "eye" | "download" | "refresh"
  | "mail" | "slack" | "whatsapp" | "flag" | "bolt";

interface Props extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, ...rest }: Props) {
  const paths: Record<IconName, React.ReactNode> = {
    check: <polyline points="3.5 8.5 7 12 13 5" />,
    x: <g><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></g>,
    arrowRight: <g><line x1="3" y1="8" x2="13" y2="8" /><polyline points="9 4 13 8 9 12" /></g>,
    arrowLeft: <g><line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" /></g>,
    chevronDown: <polyline points="4 6 8 10 12 6" />,
    chevronRight: <polyline points="6 4 10 8 6 12" />,
    info: <g><circle cx="8" cy="8" r="6" /><line x1="8" y1="7" x2="8" y2="11" /><circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" /></g>,
    warn: <g><path d="M8 2 L14.5 13 L1.5 13 Z" /><line x1="8" y1="6.5" x2="8" y2="9.5" /><circle cx="8" cy="11.3" r="0.5" fill="currentColor" stroke="none" /></g>,
    clock: <g><circle cx="8" cy="8" r="6" /><polyline points="8 4.5 8 8 10.5 9.5" /></g>,
    sparkle: <g><path d="M8 2 L9.2 6.8 L14 8 L9.2 9.2 L8 14 L6.8 9.2 L2 8 L6.8 6.8 Z" /></g>,
    package: <g><path d="M2.5 5 L8 2.5 L13.5 5 L13.5 11 L8 13.5 L2.5 11 Z" /><line x1="2.5" y1="5" x2="8" y2="7.5" /><line x1="13.5" y1="5" x2="8" y2="7.5" /><line x1="8" y1="7.5" x2="8" y2="13.5" /></g>,
    file: <g><path d="M4 2 H10 L13 5 V14 H4 Z" /><polyline points="10 2 10 5 13 5" /></g>,
    paperclip: <path d="M11 5 L6.5 9.5 a2 2 0 0 0 2.83 2.83 L13 8.5 a3 3 0 0 0 -4.24 -4.24 L4 9 a4 4 0 0 0 5.66 5.66 L13 11" />,
    user: <g><circle cx="8" cy="6" r="2.5" /><path d="M3.5 13.5 a4.5 4.5 0 0 1 9 0" /></g>,
    building: <g><rect x="3" y="3" width="10" height="11" /><line x1="6" y1="6" x2="6.5" y2="6" /><line x1="9.5" y1="6" x2="10" y2="6" /><line x1="6" y1="9" x2="6.5" y2="9" /><line x1="9.5" y1="9" x2="10" y2="9" /><line x1="7" y1="14" x2="7" y2="11.5" /><line x1="9" y1="14" x2="9" y2="11.5" /></g>,
    bell: <g><path d="M4 11 V8 a4 4 0 0 1 8 0 V11 L13 12.5 H3 Z" /><path d="M6.5 12.5 a1.5 1.5 0 0 0 3 0" /></g>,
    search: <g><circle cx="7" cy="7" r="4.5" /><line x1="10.3" y1="10.3" x2="13" y2="13" /></g>,
    plus: <g><line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" /></g>,
    sliders: <g><line x1="3" y1="5" x2="13" y2="5" /><line x1="3" y1="11" x2="13" y2="11" /><circle cx="6" cy="5" r="1.5" fill="white" /><circle cx="10" cy="11" r="1.5" fill="white" /></g>,
    truck: <g><rect x="1.5" y="5" width="7" height="6" /><path d="M8.5 7 H12 L14 9 V11 H8.5 Z" /><circle cx="4" cy="12" r="1.2" /><circle cx="11.5" cy="12" r="1.2" /></g>,
    calendar: <g><rect x="2.5" y="3.5" width="11" height="10" /><line x1="2.5" y1="6.5" x2="13.5" y2="6.5" /><line x1="5.5" y1="2" x2="5.5" y2="5" /><line x1="10.5" y1="2" x2="10.5" y2="5" /></g>,
    rupee: <g><line x1="4" y1="4" x2="12" y2="4" /><line x1="4" y1="7" x2="12" y2="7" /><path d="M5.5 4 a3 3 0 0 1 0 6 H4 L11 14" /></g>,
    spark: <g><path d="M8 1.5 L9.4 6.6 L14.5 8 L9.4 9.4 L8 14.5 L6.6 9.4 L1.5 8 L6.6 6.6 Z" /><path d="M13 2 L13.5 3.5 L15 4 L13.5 4.5 L13 6 L12.5 4.5 L11 4 L12.5 3.5 Z" strokeWidth={1} /></g>,
    moreH: <g><circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" /></g>,
    eye: <g><path d="M1 8 C 3 4 5.5 3 8 3 C 10.5 3 13 4 15 8 C 13 12 10.5 13 8 13 C 5.5 13 3 12 1 8 Z" /><circle cx="8" cy="8" r="2" /></g>,
    download: <g><line x1="8" y1="2.5" x2="8" y2="10" /><polyline points="5 7 8 10 11 7" /><line x1="3" y1="13.5" x2="13" y2="13.5" /></g>,
    refresh: <g><polyline points="13 3 13 6.5 9.5 6.5" /><path d="M13 6.5 A 5.5 5.5 0 1 0 12 11.5" /></g>,
    mail: <g><rect x="2" y="3.5" width="12" height="9" /><polyline points="2 4 8 9 14 4" /></g>,
    slack: <g><rect x="6.5" y="2.5" width="3" height="11" rx="1.5" /><rect x="2.5" y="6.5" width="11" height="3" rx="1.5" /></g>,
    whatsapp: <g><path d="M2.5 13.5 L3.5 10.5 a5 5 0 1 1 2 2 Z" /></g>,
    flag: <g><line x1="3.5" y1="2" x2="3.5" y2="14" /><path d="M3.5 2.5 L12 2.5 L10.5 5 L12 7.5 L3.5 7.5" /></g>,
    bolt: <polygon points="9 2 4 9 7.5 9 6 14 11.5 7 8.5 7 10 2" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
