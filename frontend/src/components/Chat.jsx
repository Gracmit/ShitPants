import { useEffect, useState } from "react";
import socket from "../services/socket";

const Chat = ({ lobbyId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    socket.on("chat:message", (data) => {
      setMessages((prev) => [...prev, { user: data.userName, text: data.message }]);
    });

    return () => {
      socket.off("chat:message");
    };
  }, []);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      socket.emit("chat:message", {
        lobbyId: lobbyId,
        userName: userName,
        message: messageInput,
      });
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ margin: "10px", marginBottom: "0" }}>Chat</h3>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          minHeight: "300px",
          maxHeight: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ fontSize: "14px" }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "5px", padding: "10px", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
