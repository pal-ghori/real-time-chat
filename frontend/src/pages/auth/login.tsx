import { useState } from "react";
import API, { setToken } from "../../lib/api";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const r = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);
      r.push("/");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Login</button>
      </form>
    </div>
  );
}
