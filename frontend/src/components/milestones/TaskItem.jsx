// // src/components/milestones/TaskItem.jsx
// import api from "../../api/client";

// const TaskItem = ({ task, reload, disabled }) => {
//   const toggle = async () => {
//     if (disabled) return;

//     try {
//       await api.patch(`/tasks/${task._id}`, {
//         status: task.status === "completed" ? "todo" : "completed",
//       });

//       // 🔄 Always reload from backend
//       reload();
//     } catch (err) {
//       console.error("❌ Task toggle failed:", err);
//       alert(
//         err?.response?.data?.message ||
//           "Failed to update task status"
//       );
//     }
//   };

//   return (
//     <div className="task-item">
//       <input
//         type="checkbox"
//         checked={task.status === "completed"}
//         disabled={disabled}
//         onChange={toggle}
//       />

//       <span
//         className={task.status === "completed" ? "done" : ""}
//       >
//         {task.title}
//       </span>
//     </div>
//   );
// };

// export default TaskItem;
import api from "../../api/client";
import "./TaskItem.css";

const TaskItem = ({ task, reload, disabled }) => {
  const isCompleted = task.status === "completed";

  const toggle = async () => {
    if (disabled) return;

    try {
      await api.patch(`/tasks/${task._id}`, {
        status: isCompleted ? "todo" : "completed",
      });
      reload();
    } catch (err) {
      console.error("❌ Task toggle failed:", err);
      alert(err?.response?.data?.message || "Failed to update task status");
    }
  };

  return (
    <div 
      className={`exe-task-row ${isCompleted ? "is-done" : ""} ${disabled ? "is-locked" : ""}`}
      onClick={!disabled ? toggle : undefined}
    >
      <div className="task-checkbox-wrapper">
        <div className={`custom-checkbox ${isCompleted ? "checked" : ""}`}>
          {isCompleted && <span className="check-mark">L</span>}
        </div>
      </div>

      <div className="task-label-group">
        <span className="task-text">{task.title}</span>
        {isCompleted && <span className="task-audit-tag">Verified</span>}
      </div>
    </div>
  );
};

export default TaskItem;