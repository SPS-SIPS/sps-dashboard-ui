
type ParticipantLiveIconProps = {
  isLive: boolean;
};

export const ParticipantLiveIcon = ({ isLive }: ParticipantLiveIconProps) => {
  const color = !isLive ? "bg-red-500" : "bg-emerald-500";

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
};
