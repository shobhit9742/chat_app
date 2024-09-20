import React from "react";

const Message = ({ message, currentUser }) => {
  const isCurrentUser = message.user === currentUser;
  const messageClass = isCurrentUser ? "message own-message" : "message";

  return (
    <div className={messageClass}>
      <strong>{message.user}:</strong> {message.text}
    </div>
  );
};

export default Message;
