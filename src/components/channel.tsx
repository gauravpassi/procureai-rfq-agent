import { Pill } from "@/components/pill";
import type { IconName } from "@/components/icon";

const map: Record<"slack" | "email" | "whatsapp", { icon: IconName; label: string }> = {
  slack: { icon: "slack", label: "Slack" },
  email: { icon: "mail", label: "Email" },
  whatsapp: { icon: "whatsapp", label: "WhatsApp" },
};

export function Channel({ kind }: { kind: keyof typeof map }) {
  const m = map[kind];
  return <Pill tone="neutral" icon={m.icon} size="sm">{m.label}</Pill>;
}
