import { useEffect, useState } from "react";
import API, { setToken } from "../lib/api";
import Link from "next/link";
import io from "socket.io-client";

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token) setToken(token);
    fetchRooms();
  }, []);

  async function fetchRooms() {
    const res = await API.get("/api/rooms");
    setRooms(res.data);
  }

  async function createRoom() {
    if (!name) return;
    await API.post("/api/rooms", { name });
    setName("");
    fetchRooms();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Rooms</h2>
      <div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Room name" />
        <button onClick={createRoom}>Create</button>
      </div>
      <ul>
        {rooms.map(r => (
          <li key={r._id}><Link href={`/chat/${r._id}`}>{r.name}</Link></li>
        ))}
      </ul>
    </div>
  );
}
