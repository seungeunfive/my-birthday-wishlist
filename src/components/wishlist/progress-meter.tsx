type ProgressMeterProps = {
  label: string;
  percent: number;
  size?: "normal" | "large";
};

export function ProgressMeter({
  label,
  percent,
  size = "normal",
}: ProgressMeterProps) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const heightClass = size === "large" ? "h-6" : "h-4";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span>{label}</span>
        <span>{safePercent}%</span>
      </div>
      <div
        className={`pixel-progress ${heightClass}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <div
          className="pixel-progress-fill"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
