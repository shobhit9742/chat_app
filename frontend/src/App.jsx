// frontend/src/App.js

import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import API from "./utils/api";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Optionally, verify token with backend
        // For simplicity, decode token on frontend to get username
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        setUsername(decoded.username);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(err);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Auth setAuth={setIsAuthenticated} />
      ) : (
        <Chat setAuth={setIsAuthenticated} username={username} />
      )}
    </div>
  );
}

export default App;
