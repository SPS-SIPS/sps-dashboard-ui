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

        void loadHealth();
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);


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
        ring-2
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        bg-gray-800"
            >
                <HealthStatusIcon status={health.status}/>
                <span>{health.status.toUpperCase()}</span>


            </button>

            {menuOpen && (
                <SystemHealthDropdown health={health}/>
            )}
        </div>
    );
}
