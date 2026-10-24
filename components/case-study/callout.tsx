import type { ReactNode } from "react";
import { calloutTones, isCalloutTone, type CalloutTone } from "./options";

const toneClassName: Record<CalloutTone, string> = {
  note: "border border-surface-border",
  warning: "border border-surface-border border-l-2 border-l-foreground",
};

export function Callout({
  title,
  tone = "note",
  children,
}: {
  title?: string;
  tone?: string;
  children?: ReactNode;
}) {
  if (!isCalloutTone(tone)) {
    const expected = calloutTones.map((item) => item.value).join(", ");
    throw new Error(
      `Unknown Callout tone "${tone}". Expected one of: ${expected}.`,
    );
  }

  return (
    <aside className={`not-prose my-8 bg-surface px-4 py-3 ${toneClassName[tone]}`}>
      {title ? <p className="mb-1 text-sm font-bold">{title}</p> : null}
      <div className="text-pretty leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  );
}
