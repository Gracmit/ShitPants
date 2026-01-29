import { useEffect, useState } from "react";
import socket from "../services/socket";

const Chat = ({ lobbyId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) setMessages(JSON.parse(saved));

    socket.on("chat:message", (data) => {
      setMessages((prev) => {
        const updated = [...prev, { user: data.userName, text: data.message }];
        localStorage.setItem("chatMessages", JSON.stringify(updated));
        return updated;
      });
    });

    return () => socket.off("chat:message");
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    socket.emit("chat:message", { lobbyId, userName, message: messageInput });
    setMessageInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="chat card">
      <h3 className="card-title">Chat</h3>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="input"
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Type a message..."
        />
        <button className="btn primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
