/**
 * Dev-only Intake surface — no auth required.
 * Navigate to /dev/intake to see the full agent intake demo.
 */
import { IntakeShell } from "@/components/intake/intake-shell";

export const dynamic = "force-dynamic";

export default function DevIntakePage() {
  return <IntakeShell />;
}
