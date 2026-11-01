"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../lib/api";
import { clearCredentials, restoreSession, setCredentials } from "../lib/authSlice";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user, ready } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      dispatch(restoreSession({ token: savedToken, user: JSON.parse(savedUser) }));
      router.replace("/projects");
    } else {
      dispatch(clearCredentials());
    }
  }, [dispatch, router]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    console.log("Submitting form:", form, "Mode:", mode);
    try {
      const result = await api(`/auth/${mode}`, {
        method: "POST",
        body: form,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      dispatch(setCredentials(result));
      router.push("/projects");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (ready && token && user) return null;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">✦ <span>daymark</span></Link>
        <div className="auth-intro">
          <p className="eyebrow">YOUR WORK, IN ONE PLACE</p>
          <h1>{mode === "login" ? "Welcome back." : "Make space for progress."}</h1>
          <p>{mode === "login" ? "Sign in to pick up where you left off." : "Create an account to start organizing your projects."}</p>
        </div>
        <form onSubmit={submit} className="form-stack">
          {mode === "register" && (
            <label>Your name
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" />
            </label>
          )}
          <label>Email address
            <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>Password
            <input type="password" minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button primary full" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
      <aside className="auth-art">
        <div className="art-note"><span className="note-dot" /> A little more focus, every day.</div>
        <div className="art-content">
          <div className="mini-window">
            <div className="window-top"><span /><span /><span /><i>Today at a glance</i></div>
            <div className="window-body">
              <div className="mock-caption">YOUR PROJECTS <b>03</b></div>
              <div className="mock-project"><span className="project-icon peach">✳</span><div><strong>Website refresh</strong><small>5 tasks · updated today</small></div><span className="mock-arrow">↗</span></div>
              <div className="mock-project"><span className="project-icon blue">◈</span><div><strong>Spring campaign</strong><small>8 tasks · due in 6 days</small></div><span className="mock-arrow">↗</span></div>
              <div className="mock-project"><span className="project-icon green">⌁</span><div><strong>Learn something new</strong><small>2 tasks · just started</small></div><span className="mock-arrow">↗</span></div>
              <div className="mock-progress"><div><span>Weekly progress</span><b>72%</b></div><i><span /></i></div>
            </div>
          </div>
          <h2>Small steps.<br />Big things get done.</h2>
          <p>A calm, simple space to keep your projects moving forward.</p>
        </div>
        <div className="art-footer">MAKE PROGRESS, AT YOUR OWN PACE <span>✦</span></div>
      </aside>
    </main>
  );
}
