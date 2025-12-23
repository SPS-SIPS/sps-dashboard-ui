// components/SystemHealth/HealthStatusIcon.tsx
import React from 'react';

type Status = 'UP' | 'DEGRADED' | 'DOWN';

const statusColorMap: Record<Status, string> = {
  UP: 'bg-emerald-500',
  DEGRADED: 'bg-amber-500',
  DOWN: 'bg-red-500',
};

export const HealthStatusIcon = ({ status }: { status: Status }) => (
  <span
    className={`inline-block h-2.5 w-2.5 rounded-full ${statusColorMap[status]}`}
  />
);
