import { useEffect, useRef, useState } from 'react';
import useParticipants from '../../api/hooks/useParticipants';
import LiveParticipantsDropdown from './LiveParticipantsDropdown';

export default function ParticipantLiveIndicator() {
  const { getLiveParticipants } = useParticipants();

  const [menuOpen, setMenuOpen] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getLiveParticipants();
        setParticipant(data);
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
                Checking available participants...
            </div>
        );
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-white
        rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 hover:cursor-pointer hover:text-gray-900
        ring-2
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        bg-gray-800"
            >
                <h3 className='text-bold'>Participants</h3>


            </button>

            {menuOpen && (
                <LiveParticipantsDropdown participant={participant}/>
            )}
        </div>
    );
}
