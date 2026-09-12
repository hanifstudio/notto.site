import { CheckCircleBold, CopyBold, DangerCircleBold, LockKeyholeBold, RefreshCircleBold } from "solar-icon-set";
import { cn } from "@/lib/cn";

export type CopyStatus = "idle" | "copying" | "copied" | "error";

export function CopyButton({
  status,
  locked = false,
  detailed = false,
  onClick,
}: {
  status: CopyStatus;
  locked?: boolean;
  detailed?: boolean;
  onClick: () => void;
}) {
  const labels: Record<CopyStatus, string> = {
    idle: locked && detailed ? "Unlock to copy — $12" : "Copy HTML",
    copying: "Copying…",
    copied: "HTML copied",
    error: detailed ? "Couldn't copy — try again" : "Couldn't copy — retry",
  };
  const Icon =
    status === "copying"
      ? RefreshCircleBold
      : status === "copied"
        ? CheckCircleBold
        : status === "error"
          ? DangerCircleBold
          : locked
            ? LockKeyholeBold
            : CopyBold;

  return (
    <button
      className={cn("copy-button", `copy-button--${status}`, detailed && "copy-button--detail")}
      type="button"
      onClick={onClick}
      disabled={status === "copying"}
      aria-label={`${labels[status]}${locked && status === "idle" ? ", premium template" : ""}`}
    >
      <Icon className={status === "copying" ? "spin" : undefined} aria-hidden="true" />
      <span>{labels[status]}</span>
    </button>
  );
}
