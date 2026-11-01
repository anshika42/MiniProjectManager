"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../lib/api";
import { clearCredentials, restoreSession } from "../../lib/authSlice";

const icons = ["✳", "◈", "⌁", "✦"];
const colors = ["peach", "blue", "green", "violet"];

export default function ProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user, ready } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken && savedUser) dispatch(restoreSession({ token: savedToken, user: JSON.parse(savedUser) }));
      else dispatch(clearCredentials());
      return;
    }
    if (!token) {
      router.replace("/");
      return;
    }
    api("/projects", { token }).then(setProjects).catch((requestError) => {
      setError(requestError.message);
      if (requestError.message.includes("session")) logout();
    }).finally(() => setLoading(false));
  }, [dispatch, ready, token, router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(clearCredentials());
    router.replace("/");
  }

  async function createProject(event) {
    event.preventDefault();
    setError("");
    try {
      const project = await api("/projects", { token, method: "POST", body: { title, description } });
      setProjects([project, ...projects]);
      setTitle("");
      setDescription("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteProject(projectId) {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api(`/projects/${projectId}`, { token, method: "DELETE" });
      setProjects(projects.filter((project) => project._id !== projectId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveProject(event) {
    event.preventDefault();
    try {
      const updatedProject = await api(`/projects/${editingId}`, {
        token,
        method: "PATCH",
        body: editForm,
      });
      setProjects(projects.map((project) => project._id === editingId ? updatedProject : project));
      setEditingId(null);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!ready || !token) return <div className="loading-screen">Getting things ready...</div>;

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/projects">✦ <span>daymark</span></Link>
        <div className="topbar-right"><span className="user-greeting">Hello, {user?.name?.split(" ")[0] || "there"}</span><button className="button quiet" onClick={logout}>Sign out</button></div>
      </header>
      <section className="page-content">
        <div className="page-heading">
          <div><p className="eyebrow">YOUR WORKSPACE</p><h1>My projects<span className="heading-count">{projects.length.toString().padStart(2, "0")}</span></h1><p className="subheading">A little progress adds up. What are you working on?</p></div>
        </div>
        {error && <p className="error inline-error">{error}</p>}
        <section className="create-card">
          <div className="create-symbol">＋</div>
          <div className="create-heading"><h2>Start something new</h2><p>Give your next project a name.</p></div>
          <form onSubmit={createProject} className="create-form">
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Plan a weekend trip" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short description (optional)" />
            <button className="button primary" disabled={!title.trim()}>Create project <span>→</span></button>
          </form>
        </section>
        <div className="section-title"><h2>All projects</h2><span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span></div>
        {loading ? <div className="empty-state">Loading your projects...</div> : projects.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✳</div><h3>Your next big thing starts here.</h3><p>Create a project above and break it into simple tasks.</p></div>
        ) : (
          <div className="project-grid">
            {projects.map((project, index) => {
              const completed = project.tasks.filter((task) => task.status === "done").length;
              const total = project.tasks.length;
              return (
                <article className="project-card" key={project._id}>
                  <div className="project-card-top"><span className={`project-icon ${colors[index % colors.length]}`}>{icons[index % icons.length]}</span><div className="project-actions"><button className="text-button" onClick={() => { setEditingId(project._id); setEditForm({ title: project.title, description: project.description }); }}>Edit</button><button className="icon-button" aria-label={`Delete ${project.title}`} onClick={() => deleteProject(project._id)}>×</button></div></div>
                  {editingId === project._id ? (
                    <form className="project-edit-form" onSubmit={saveProject}>
                      <input required aria-label="Project title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
                      <textarea rows="2" aria-label="Project description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} placeholder="Description (optional)" />
                      <div><button className="button primary" type="submit">Save changes</button><button className="button quiet" type="button" onClick={() => setEditingId(null)}>Cancel</button></div>
                    </form>
                  ) : <>
                    <Link href={`/projects/${project._id}`} className="project-card-link"><h3>{project.title}</h3><p>{project.description || "No description yet."}</p><div className="project-meta"><span>{total} {total === 1 ? "task" : "tasks"}</span><span>{total ? `${Math.round(completed / total * 100)}% complete` : "Ready to begin"}</span></div><div className="progress-track"><span style={{ width: `${total ? completed / total * 100 : 0}%` }} /></div></Link>
                    <Link href={`/projects/${project._id}`} className="card-link-label">Open project <span>↗</span></Link>
                  </>}
                </article>
              );
            })}
          </div>
        )}
      </section>
      <footer className="app-footer"><span>✦ daymark</span><span>One thing at a time.</span></footer>
    </main>
  );
}
