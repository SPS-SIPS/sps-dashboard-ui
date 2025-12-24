import { HealthStatusIcon } from "./HealthStatusIcon";
const statusColorMap: Record<string, string> = {
  ok: "bg-emerald-500",
  degraded: "bg-amber-500",
  error: "bg-red-500",
};
const componentsStatusColorMap: Record<string, string> = {
  ok: "border-emerald-500",
  degraded: "border-red-500",
  error: "border-red-500",
};
export default function SystemHealthDropdown({ health }: any) {
  return (
    <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
      <div className="px-4 py-3 border-b">
        <div
          className={`flex items-center gap-2 ${
            statusColorMap[health.status.toLowerCase()] || "bg-gray-500"
          } px-2 py-1 rounded-md text-sm text-white font-medium}`}
        >
          <HealthStatusIcon status={health.status.toLowerCase()} />
          <span className="font-semibold">
            Overall Status: {health.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y  ">
        {health.components.map((component: any) => (
          <div
            key={component.name.toUpperCase()}
            className={`px-4 py-3 text-sm border-l-4
           ${
             componentsStatusColorMap[component.status.toLowerCase()] ||
             "border-gray-300"
           }`}
          >
            <div className="flex items-center justify-between ">
              <span className="font-medium">
                {component.name.toUpperCase()}
              </span>
              <HealthStatusIcon status={component.status.toLowerCase()} />
            </div>

            <div className="mt-1 text-xs text-gray-600 space-y-0.5 ">
              <p>Endpoint: {component.endpointStatus}</p>
              <p>HTTP: {component.httpResult}</p>
              <p>
                Checked: {new Date(component.lastChecked).toLocaleTimeString()}
              </p>
            </div>

            {component.errorMessage && (
              <p className="mt-2 text-xs text-red-600">
                {component.errorMessage}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
