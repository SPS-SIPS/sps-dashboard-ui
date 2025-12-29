import { ParticipantLiveIcon } from "./ParticipantLiveIcon";

export default function LiveParticipantsDropdown({ participant }: any) {
  return (
    <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
     
     <div className="px-4 py-3 border-b">
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm text-white font-medium 
          `}
        >
        
          <span className="font-semibold">
           
          </span>
        </div>
      </div> 

   
      <div className="max-h-96 overflow-y-auto divide-y">
        {participant.map((component: any) => (
          <div
            key={component.institutionName.toUpperCase()}
            className={`px-4 py-3 text-sm border-l-4 ${
              !component.isLive ? "border-red-500" : "border-emerald-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{component.institutionName.toUpperCase()}</span>
              <ParticipantLiveIcon isLive={component.isLive} />
            </div>
            {component.errorMessage && (
              <p className="mt-2 text-xs text-red-600 bg-red-100 font-bold">
                {component.errorMessage}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
