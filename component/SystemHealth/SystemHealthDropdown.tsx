import { HealthStatusIcon } from "./HealthStatusIcon";

const statusColorMap: Record<string, string> = {
  ok: "bg-green-500",
  degraded: "bg-amber-500",
  error: "bg-red-500",
};

const componentsStatusColorMap: Record<string, string> = {
  ok: "border-green-500",
  degraded: "border-amber-500",
  error: "border-red-500",
};

const zoneBorderColorMap: Record<string, string> = {
  green: "border-green-500",
  amber: "border-amber-500",
  red: "border-red-500",
};

const zoneTextColorMap: Record<string, string> = {
  green: "text-green-600 font-semibold",
  amber: "text-amber-600 font-semibold",
  red: "text-red-600 font-semibold",
};

const extractZone = (httpResult?: string) => {
  if (!httpResult) return null;
  const match = httpResult.match(/zone:\s*(green|amber|red)/i);
  return match ? match[1].toLowerCase() : null;
};

const formatHttpResult = (httpResult?: string) => {
  if (!httpResult) return null;

  const zoneMatch = httpResult.match(/zone:\s*(green|amber|red)/i);
  const balanceMatch = httpResult.match(/balance:\s*[\d,\.]+\s*usd/i);

  return (
    <>
      {zoneMatch && (
        <>
          <span>Zone: </span>
          <span className={zoneTextColorMap[zoneMatch[1].toLowerCase()]}>
            {zoneMatch[1]}
          </span>
        </>
      )}

      {zoneMatch && balanceMatch && <span>, </span>}

      {balanceMatch && (
        <strong className="font-semibold text-gray-900">
          {balanceMatch[0]}
        </strong>
      )}
    </>
  );
};

export default function SystemHealthDropdown({ health, error, hasHealth }: any) {
  return (
    <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
     
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">System Health Status</span>
          {hasHealth && (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm text-white font-medium ${
              statusColorMap[health.status.toLowerCase()] || "bg-gray-500"
            }`}>
              <HealthStatusIcon status={health.status.toLowerCase()} />
              <span className="font-semibold">
                {health.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y">
        {hasHealth ? (
          health.components.map((component: any) => {
            const isBalanceStatus = component.name === "balance-status";
            const zone = isBalanceStatus
              ? extractZone(component.httpResult)
              : null;

            const borderColor =
              isBalanceStatus && zone
                ? zoneBorderColorMap[zone]
                : componentsStatusColorMap[component.status.toLowerCase()] ||
                  "border-gray-300";

            return (
              <div
                key={component.name}
                className={`px-4 py-3 text-sm border-l-4 ${borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {component.name.toUpperCase()}
                  </span>
                  <HealthStatusIcon status={component.status.toLowerCase()} />
                </div>

                <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                  <p>Endpoint: {component.endpointStatus}</p>

                  <p>
                    HTTP:{" "}
                    {isBalanceStatus
                      ? formatHttpResult(component.httpResult)
                      : component.httpResult}
                  </p>

                  <p>
                    Checked:{" "}
                    {new Date(component.lastChecked).toLocaleTimeString()}
                  </p>
                </div>

                {component.errorMessage && (
                  <p className="mt-2 text-xs text-red-600 bg-red-100 font-bold px-2 py-1 rounded">
                    {component.errorMessage}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          // No health data/error state
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {error ? 'Unable to Load Health Status' : 'No Health Data Available'}
            </h4>
            
            <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
              {error || 'System health information is currently unavailable.'}
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