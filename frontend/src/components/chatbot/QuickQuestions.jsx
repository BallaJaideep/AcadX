// const studentQuestions = [
//   "What should I complete next?",
//   "Explain my project status",
//   "Help me with a coding problem",
//   "Guide me to improve my resume ATS score",
//   "Career guidance for my skills",
//   "I have another question",
// ];

// const facultyQuestions = [
//   "How is the student progressing?",
//   "Which milestones are pending?",
//   "Give mentoring suggestions",
//   "Help with project evaluation",
//   "I have another question",
// ];

// const QuickQuestions = ({ role, onSelect }) => {
//   const questions =
//     role === "faculty" || role === "hod" || role === "admin"
//       ? facultyQuestions
//       : studentQuestions;

//   return (
//     <div className="quick-questions">
//       <p className="quick-title">
//         Suggested questions
//       </p>

//       {questions.map((q, i) => (
//         <button
//           key={i}
//           onClick={() => onSelect(q)}
//         >
//           {q}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default QuickQuestions;
import "./QuickQuestions.css";

const studentQuestions = [
  "What should I complete next?",
  "Explain my project status",
  "Help me with a coding problem",
  "Improve my resume ATS score",
  "Career guidance for my skills",
  "I have another question",
];

const facultyQuestions = [
  "How is the student progressing?",
  "Which milestones are pending?",
  "Give mentoring suggestions",
  "Help with project evaluation",
  "I have another question",
];

const QuickQuestions = ({ role, onSelect }) => {
  const isFaculty = ["faculty", "hod", "admin"].includes(role);
  const questions = isFaculty ? facultyQuestions : studentQuestions;

  return (
    <div className="exe-quick-prompts">
      <div className="prompts-header">
        <span className="spark-icon">✨</span>
        <p className="prompts-title">Suggested Inquiries</p>
      </div>

      <nav className="prompts-grid">
        {questions.map((q, i) => (
          <button
            key={i}
            className="exe-prompt-chip"
            onClick={() => onSelect(q)}
          >
            {q}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default QuickQuestions;