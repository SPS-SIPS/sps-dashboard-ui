import { useEffect, useRef, useState } from 'react';
import useSystemHealth from '../../api/hooks/useSystemHealth';
import { HealthStatusIcon } from './HealthStatusIcon';
import SystemHealthDropdown from './SystemHealthDropdown';

export default function SystemHealthIndicator() {
  const { getSystemHealth } = useSystemHealth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        setError(null);
        const data = await getSystemHealth();
        
        if (!data) {
          setHealth(null);
          return;
        }
        
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load system health');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    void loadHealth();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Check if health data is valid
  const hasHealthData = () => {
    if (!health) return false;
    
    // Check if it has the required structure
    if (!health.status || !Array.isArray(health.components)) {
      return false;
    }
    
    return true;
  };

  const getHealthStatusColor = (status: string) => {
    if (!health) return 'bg-gray-500';
    
    switch (status?.toLowerCase()) {
      case 'ok': return 'bg-green-500';
      case 'degraded': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const healthStatus = health?.status?.toLowerCase() || 'unknown';
  const healthColor = getHealthStatusColor(healthStatus);
  const hasHealth = hasHealthData();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-gray-300"/>
        Checking health…
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white
          rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 hover:cursor-pointer hover:text-gray-900
          ring-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
          bg-gray-800 transition-colors duration-200"
        aria-label="System health status"
        disabled={!hasHealth && !error}
      >
        <div className="flex items-center gap-2">
          <HealthStatusIcon status={healthStatus} />
          <h3 className="font-semibold">System Health</h3>
          {hasHealth && healthStatus !== 'unknown' && (
            <span className={`${healthColor} text-white text-xs font-bold px-1.5 py-0.5 rounded-full`}>
              {health.status.toUpperCase()}
            </span>
          )}
        </div>
      </button>

      {menuOpen && (
        <SystemHealthDropdown health={health} error={error} hasHealth={hasHealth} />
      )}
    </div>
  );
}