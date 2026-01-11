import { ParticipantLiveIcon } from "./ParticipantLiveIcon";

export default function LiveParticipantsDropdown({ participant, error, hasParticipants }: any) {
  // Normalize participant data to array
  const getParticipantsArray = () => {
    if (!participant) return [];
    
    if (Array.isArray(participant)) {
      return participant;
    }
    
    if (typeof participant === 'object' && participant !== null) {
      // Check for participants array
      if (Array.isArray(participant.participants)) {
        return participant.participants;
      }
    }
    
    return [];
  };

  const participantsArray = getParticipantsArray();

  return (
    <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
     
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">Live Participants</span>
          {hasParticipants && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
              {participantsArray.length} active
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="max-h-96 overflow-y-auto divide-y">
        {hasParticipants ? (
          participantsArray.map((component: any, index: number) => (
            <div
              key={component.institutionName?.toUpperCase() || index}
              className={`px-4 py-3 text-sm border-l-4 ${
                !component.isLive ? "border-red-500" : "border-emerald-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {component.institutionName?.toUpperCase() || 'Unknown Institution'}
                </span>
                <ParticipantLiveIcon isLive={component.isLive} />
              </div>
              {component.errorMessage && (
                <p className="mt-2 text-xs text-red-600 bg-red-100 font-bold px-2 py-1 rounded">
                  {component.errorMessage}
                </p>
              )}
            </div>
          ))
        ) : (
          // No participants/error state
          <div className="px-4 py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              {error ? (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {error ? 'Unable to Load Participants' : 'No Active Participants'}
            </h4>
            
            <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
              {error || 'There are currently no active participants in the system.'}
            </p>
            
            {error && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}