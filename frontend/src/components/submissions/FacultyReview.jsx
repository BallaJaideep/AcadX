import api from "../../api/client";

const FacultyReview = ({ submission }) => {
  const review = async (status) => {
    const feedback = prompt("Feedback:");
    await api.patch(`/submissions/${submission._id}/review`, {
      status,
      feedback,
    });
    alert("Reviewed");
  };

  return (
    <div>
      <a href={submission.fileUrl} target="_blank">View File</a>
      <button onClick={() => review("ACCEPTED")}>Accept</button>
      <button onClick={() => review("REJECTED")}>Reject</button>
    </div>
  );
};

export default FacultyReview;
