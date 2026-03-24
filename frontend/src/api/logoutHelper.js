export const logoutUser = () => {
  localStorage.removeItem("elor_token");
  localStorage.removeItem("elor_user");
};
