import { useEffect, useRef, useState } from "react";
import useParticipants from "../../api/hooks/useParticipants";
import LiveParticipantsDropdown from "./LiveParticipantsDropdown";

export default function ParticipantLiveIndicator() {
  const { getLiveParticipants } = useParticipants();

  const [menuOpen, setMenuOpen] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setError(null);
        const data = await getLiveParticipants();
        
        
        if (!data) {
          setParticipant(null);
          return;
        }
        
        setParticipant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load participants');
        setParticipant(null);
      } finally {
        setLoading(false);
      }
    };

    void loadParticipants();
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


  const getParticipantsCount = () => {
    if (!participant) return 0;
    
    if (Array.isArray(participant)) {
      return participant.length;
    }
    
    if (typeof participant === 'object' && participant !== null) {
     
      if (Array.isArray((participant as any).participants)) {
        return (participant as any).participants.length;
      }
     
      if (typeof (participant as any).count === 'number') {
        return (participant as any).count;
      }
    }
    
    return 0;
  };

  const participantsCount = getParticipantsCount();
  const hasParticipants = participantsCount > 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-gray-300"/>
        Loading participants...
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white
          rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 hover:cursor-pointer hover:text-gray-900
          ring-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
          bg-gray-800 transition-colors duration-200"
        aria-label="Live participants"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold">Participants</h3>
          {hasParticipants && (
            <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {participantsCount}
            </span>
          )}
        </div>
      </button>

      {menuOpen && <LiveParticipantsDropdown participant={participant} error={error} hasParticipants={hasParticipants} />}
    </div>
  );
}