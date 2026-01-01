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

export default function SystemHealthDropdown({ health }: any) {
  return (
    <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
   
      <div className="px-4 py-3 border-b">
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm text-white font-medium ${
            statusColorMap[health.status.toLowerCase()] || "bg-gray-500"
          }`}
        >
          <HealthStatusIcon status={health.status.toLowerCase()} />
          <span className="font-semibold">
            Overall Status: {health.status.toUpperCase()}
          </span>
        </div>
      </div>

    
      <div className="max-h-96 overflow-y-auto divide-y">
        {health.components.map((component: any) => {
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
        })}
      </div>
    </div>
  );
}
