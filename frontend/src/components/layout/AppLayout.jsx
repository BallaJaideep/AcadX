// import { useState } from "react";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
// import Chatbot from "../chatbot/Chatbot";

// const AppLayout = ({ children }) => {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <>
//       <Navbar onToggleSidebar={() => setCollapsed((c) => !c)} />
//       <Sidebar collapsed={collapsed} />

//       <main
//         style={{
//           marginLeft: collapsed ? 70 : 240,
//           marginTop: 60,
//           padding: 24,
//           minHeight: "100vh",
//           background: "#f8fafc",
//           transition: "margin-left 0.25s ease",
//         }}
//       >
//         {children}
//       </main>

//       {/* 🔥 CHATBOT — ONLY AFTER LOGIN */}
//       <Chatbot />
//     </>
//   );
// };

// export default AppLayout;
import Navbar from "./Navbar";
import Chatbot from "../chatbot/Chatbot";
import "./AppLayout.css";

const AppLayout = ({ children }) => {
  return (
    <div className="acadx-app-frame">
      {/* GLOBAL TOP NAVIGATION */}
      <Navbar />
      
      {/* PRIMARY VIEWPORT */}
      <main className="acadx-main-viewport">
        <div className="acadx-content-container fade-in">
          {children}
        </div>
      </main>

      {/* INTELLIGENT ASSISTANT */}
      <Chatbot />
    </div>
  );
};

export default AppLayout;
