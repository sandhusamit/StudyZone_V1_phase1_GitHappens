import { useState, useEffect } from "react";
export default function quizList() {
  return (
    <>
      <div>
        <h2>Quizzes go here from Mongo</h2>
      </div>
    </>
  );
}

//   // create state for page data variables
//   const [pageData, setPageData] = useState({
//     HeaderMessage: "",
//     AboutMessage: "",
//     PicturePath: ""
//   });

//   const apiURL = '/api'; // backend API URL

//   // fetch page data from backend
//   useEffect(() => {
//     fetch(`${apiURL}/about/690e437cb7760af2bfc37391`)
//       .then((res) => res.json())
//       .then((dataFromServer) => setPageData(dataFromServer))
//       .then(() => console.log("Data fetched successfully"))
//       .catch((err) => console.error("Error fetching data:", err));
//   }, []);

//   return (
//     <section style={{ margin: "2rem auto", padding: "1rem", maxWidth: "1200px", backgroundColor: "white" }}>
//       {/* Use fetched HeaderMessage */}
//       <h2 style={{ color: "#0077ff", marginBottom: "1.5rem", textAlign: "center" }}>
//         {pageData.HeaderMessage || "Loading..."}
//       </h2>

//       <div className="picture-container"
//         style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "2rem", width: "100%" }}
//       >
//         {/* Use fetched PicturePath */}
//         <img 
//           id="me" 
//           src={pageData.PicturePath || "Loading..."} 
//           alt="Samit Sandhu" 
//           style={{ height: "500px", borderRadius: "12px", objectFit: "cover" }}
//         />

//         {/* Use fetched AboutMessage */}
//         <div style={{ marginTop: "80px", flex: 1, lineHeight: "1.8rem", fontSize: 22 }}>
//           <p>{pageData.AboutMessage || `
//             Loading...
//           `}</p>

//           <a 
//             href="/Samit-Sandhu.pdf" 
//             target="_blank" 
//             rel="noopener noreferrer"
//             style={{
//               display: "inline-block",
//               padding: "0.7rem 1.2rem",
//               backgroundColor: "#0077ff",
//               color: "#fff",
//               textDecoration: "none",
//               borderRadius: "8px",
//               fontWeight: "bold",
//               marginTop: "10rem"
//             }}
//           >
//             View My Resume
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }
