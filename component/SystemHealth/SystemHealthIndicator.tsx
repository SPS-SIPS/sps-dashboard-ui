// components/SystemHealth/SystemHealthIndicator.tsx
import { useEffect, useRef, useState } from 'react';
import useSystemHealth from '../../api/hooks/useSystemHealth';
import { HealthStatusIcon } from './HealthStatusIcon';
import SystemHealthDropdown from './SystemHealthDropdown';

export default function SystemHealthIndicator() {
  const { getSystemHealth } = useSystemHealth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getSystemHealth();
        setHealth(data);
      } finally {
        setLoading(false);
      }
    };

    loadHealth();
  }, []);
  console.log('System Health:', health);
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-gray-300" />
        Checking health…
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white 
        rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 hover:text-gray-900 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        bg-gray-800"
      >
        <HealthStatusIcon status={health.status.toUpperCase()} />
        <span>{health.status.toUpperCase()}</span>

        {/* <svg
          className={`w-4 h-4 transition-transform ${
            menuOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg> */}
      </button>

      {menuOpen && (
        <SystemHealthDropdown health={health} />
      )}
    </div>
  );
}
