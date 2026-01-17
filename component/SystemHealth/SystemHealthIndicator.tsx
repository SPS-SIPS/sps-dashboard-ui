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
  const [showNoDataCard, setShowNoDataCard] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        setError(null);
        const data = await getSystemHealth();
        
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
          throw new Error('No health data available');
        }
        
        if (!data.status) {
          throw new Error('Invalid health data format');
        }
        
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load system health');
        setShowNoDataCard(true);
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

  const retryLoadHealth = async () => {
    setLoading(true);
    setShowNoDataCard(false);
    setError(null);
    
    try {
      const data = await getSystemHealth();
      
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        throw new Error('No health data available');
      }
      
      if (!data.status) {
        throw new Error('Invalid health data format');
      }
      
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system health');
      setShowNoDataCard(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-gray-300"/>
        Checking health…
      </div>
    );
  }

  if (showNoDataCard) {
    return (
      <div className="relative hidden sm:block">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 w-64">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Health Status Unavailable
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {error || 'Unable to retrieve system health information.'}
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={retryLoadHealth}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowNoDataCard(false)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ok': return 'bg-green-500';
      case 'degraded': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const healthStatus = health?.status?.toLowerCase() || 'unknown';
  const healthColor = getHealthStatusColor(healthStatus);

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white
          rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 hover:cursor-pointer hover:text-gray-900
          ring-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
          bg-gray-800 transition-colors duration-200"
        aria-label="System health status"
      >
        <div className="flex items-center gap-2">
          <HealthStatusIcon status={healthStatus} />
          <h3 className="font-semibold">System Health</h3>
          {healthStatus !== 'unknown' && (
            <span className={`${healthColor} text-white text-xs font-bold px-1.5 py-0.5 rounded-full`}>
              {health.status.toUpperCase()}
            </span>
          )}
        </div>
      </button>

      {menuOpen && (
        <SystemHealthDropdown health={health}/>
      )}
    </div>
  );
}