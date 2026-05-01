const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Terpesan",
  rejected: "Ditolak",
  expired: "Expired",
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.pending;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-full ${style} ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "pending" ? "bg-amber-500" :
        status === "confirmed" ? "bg-green-500" :
        status === "rejected" ? "bg-red-500" : "bg-gray-400"
      }`} />
      {label}
    </span>
  );
}
