import type { Signal } from "@/types/intake";
import { DraftEmail } from "./draft-email";
import { DraftSAP } from "./draft-sap";
import { DraftSalesforce } from "./draft-salesforce";
import { DraftSlack } from "./draft-slack";
import { DraftDrive } from "./draft-drive";
import { DraftCoupa } from "./draft-coupa";

interface Props { signal: Signal }

export function DraftPane({ signal }: Props) {
  switch (signal.id) {
    case "s1": return <DraftEmail />;
    case "s2": return <DraftSAP />;
    case "s3": return <DraftSalesforce />;
    case "s4": return <DraftSlack />;
    case "s5": return <DraftDrive />;
    case "s6": return <DraftCoupa />;
    default:   return <DraftEmail />;
  }
}
