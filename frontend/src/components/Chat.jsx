import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Message from "./Message";

const Chat = ({ setAuth, username }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io("https://chat-app-q0as.onrender.com/api", {
      auth: {
        token: token,
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
    });

    socketRef.current.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      if (err.message === "Authentication error") {
        alert("Authentication error. Please login again.");
        setAuth(false);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [setAuth]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (msg.trim()) {
      socketRef.current.emit("chatMessage", msg);
      setMsg("");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    socketRef.current.disconnect();
    setAuth(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={index} message={message} currentUser={username} />
        ))}
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Enter message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
