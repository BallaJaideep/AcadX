export const detectRiskStatus = ({ totalTasks, completedTasks, deadline }) => {
  const progress = completedTasks / totalTasks;
  const now = new Date();
  const due = new Date(deadline);

  if (now > due && progress < 0.5) return "at_risk";
  if (progress < 0.8) return "warning";
  return "on_track";
};
