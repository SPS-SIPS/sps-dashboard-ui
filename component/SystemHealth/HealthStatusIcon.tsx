
type Status = 'ok' | 'degraded' | 'error';

const statusColorMap: Record<Status, string> = {
  ok: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  error: 'bg-red-500',
};

export const HealthStatusIcon = ({ status }: { status: Status }) => (
  <span
    className={`inline-block h-2.5 w-2.5 rounded-full ${statusColorMap[status]}`}
  />
);
