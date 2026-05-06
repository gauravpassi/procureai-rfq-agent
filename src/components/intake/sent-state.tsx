import { Icon } from "@/components/icon";

interface Props {
  rfqId: string;
  suppliers: number;
  deadline?: string;
}

export function SentState({ rfqId, suppliers, deadline = "May 8, 5 PM IST" }: Props) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-xs text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-success-soft border border-success-border
                        text-success flex items-center justify-center">
          <Icon name="check" size={22} strokeWidth={2} />
        </div>
        <div className="text-[17px] font-semibold text-text-primary">RFQ sent</div>
        <div className="text-[13px] text-text-secondary leading-relaxed">
          <span className="mono text-text-primary">{rfqId}</span> sent to{" "}
          <strong>{suppliers} suppliers</strong>. Quotes due {deadline}.{" "}
          You&apos;ll get a comparison matrix when ≥2 quotes arrive.
        </div>
      </div>
    </div>
  );
}
