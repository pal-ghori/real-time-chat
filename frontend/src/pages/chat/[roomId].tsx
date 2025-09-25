import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import API, { setToken } from "../../lib/api";
import io from "socket.io-client";

let socket: any;

export default function ChatPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [oldestDate, setOldestDate] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !token) return;
    setToken(token);
    // load latest messages
    fetchMessages();

    // connect socket
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { auth: { token } });
    socket.emit("joinRoom", roomId);
    socket.on("message", (m: any) => {
      setMessages(prev => [m, ...prev]); // server sends saved message
    });
    return () => {
      socket.emit("leaveRoom", roomId);
      socket.disconnect();
    };
  }, [roomId, token]);

  async function fetchMessages(before?: string) {
    setPageLoading(true);
    const res = await API.get(`/api/rooms/${roomId}/messages`, { params: { before, limit: 50 }});
    // server returns messages sorted newest->oldest, so we reverse to display oldest->newest
    const msgs = res.data.reverse();
    setMessages(prev => (before ? [...msgs, ...prev] : msgs));
    if (msgs.length) setOldestDate(msgs[0].createdAt);
    setPageLoading(false);
  }

  function sendMessage(e?: any) {
    if (e) e.preventDefault();
    if (!text || !socket) return;
    socket.emit("sendMessage", { roomId, text });
    setText("");
  }

  function loadOlder() {
    if (!oldestDate) return;
    fetchMessages(oldestDate);
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Chat</h3>
      <button onClick={loadOlder} disabled={pageLoading}>Load older</button>
      <div style={{ border: "1px solid #ddd", height: 400, overflow: "auto", display: "flex", flexDirection: "column-reverse" }}>
        <div ref={scrollRef}/>
        <div>
          {messages.map(m => (
            <div key={m._id} style={{ padding: 8 }}>
              <strong>{m.sender.displayName}</strong>: {m.text} <small>{new Date(m.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={sendMessage}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Message..." />
        <button>Send</button>
      </form>
    </div>
  );
}
