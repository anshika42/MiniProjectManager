"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../lib/api";
import { clearCredentials, restoreSession } from "../../../lib/authSlice";

const statusNames = { todo: "To do", "in-progress": "In progress", done: "Done" };

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user, ready } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "todo", dueDate: "" });
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("createdAt");
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
    api(`/projects/${id}`, { token }).then(setProject).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [dispatch, id, ready, router, token]);

  const visibleTasks = useMemo(() => {
    if (!project) return [];
    return [...project.tasks]
      .filter((task) => filter === "all" || task.status === filter)
      .sort((a, b) => sort === "dueDate"
        ? (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, project, sort]);

  async function addTask(event) {
    event.preventDefault();
    setError("");
    try {
      const task = await api(`/projects/${id}/tasks`, {
        token, method: "POST", body: { ...form, dueDate: form.dueDate || null },
      });
      setProject({ ...project, tasks: [...project.tasks, task] });
      setForm({ title: "", description: "", dueDate: "" });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateTask(taskId, updates) {
    try {
      const task = await api(`/projects/${id}/tasks/${taskId}`, { token, method: "PATCH", body: updates });
      setProject({ ...project, tasks: project.tasks.map((item) => item._id === taskId ? task : item) });
      setError("");
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    }
  }

  async function deleteTask(taskId) {
    try {
      await api(`/projects/${id}/tasks/${taskId}`, { token, method: "DELETE" });
      setProject({ ...project, tasks: project.tasks.filter((task) => task._id !== taskId) });
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveTaskEdit(event) {
    event.preventDefault();
    if (await updateTask(editingTaskId, { ...editForm, dueDate: editForm.dueDate || null })) {
      setEditingTaskId(null);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(clearCredentials());
    router.replace("/");
  }

  if (!ready || !token) return <div className="loading-screen">Getting things ready...</div>;
  if (loading) return <div className="loading-screen">Opening your project...</div>;
  if (!project) return <main className="app-shell"><header className="topbar"><Link className="brand" href="/projects">✦ <span>daymark</span></Link><button className="button quiet" onClick={logout}>Sign out</button></header><section className="page-content"><p className="error">{error || "Project not found."}</p><Link className="back-link" href="/projects">← Back to projects</Link></section></main>;

  const completed = project.tasks.filter((task) => task.status === "done").length;

  return (
    <main className="app-shell">
      <header className="topbar"><Link className="brand" href="/projects">✦ <span>daymark</span></Link><div className="topbar-right"><span className="user-greeting">Hello, {user?.name?.split(" ")[0] || "there"}</span><button className="button quiet" onClick={logout}>Sign out</button></div></header>
      <section className="page-content detail-content">
        <Link className="back-link" href="/projects">← All projects</Link>
        <div className="detail-heading"><div><p className="eyebrow">PROJECT</p><h1>{project.title}</h1><p className="subheading">{project.description || "A clear plan starts with one small task."}</p></div><div className="completion-box"><strong>{project.tasks.length ? Math.round(completed / project.tasks.length * 100) : 0}%</strong><span>complete</span></div></div>
        {error && <p className="error inline-error">{error}</p>}
        <div className="task-layout">
          <section className="task-main">
            <div className="section-title task-section-title"><h2>Your tasks <span className="heading-count">{project.tasks.length.toString().padStart(2, "0")}</span></h2><div className="task-controls"><select aria-label="Filter tasks" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select><select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}><option value="createdAt">Newest first</option><option value="dueDate">Due date</option></select></div></div>
            {visibleTasks.length === 0 ? <div className="empty-state task-empty"><div className="empty-icon">☑</div><h3>{project.tasks.length ? "No tasks match this filter." : "A good plan starts small."}</h3><p>{project.tasks.length ? "Try a different status." : "Add your first task to get moving."}</p></div> : (
              <div className="task-list">{visibleTasks.map((task) => (
                <article className={`task-row ${task.status === "done" ? "task-done" : ""}`} key={task._id}>
                  {editingTaskId === task._id ? (
                    <form className="task-edit-form" onSubmit={saveTaskEdit}>
                      <input required aria-label="Task title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
                      <textarea rows="2" aria-label="Task description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} placeholder="Description (optional)" />
                      <div className="task-edit-fields">
                        <select aria-label="Task status" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select>
                        <input aria-label="Due date" type="date" value={editForm.dueDate} onChange={(event) => setEditForm({ ...editForm, dueDate: event.target.value })} />
                      </div>
                      <div><button className="button primary" type="submit">Save</button><button className="button quiet" type="button" onClick={() => setEditingTaskId(null)}>Cancel</button></div>
                    </form>
                  ) : <>
                    <button className={`check-button ${task.status === "done" ? "checked" : ""}`} aria-label={task.status === "done" ? "Mark as not done" : "Mark as done"} onClick={() => updateTask(task._id, { status: task.status === "done" ? "todo" : "done" })}>{task.status === "done" ? "✓" : ""}</button>
                    <div className="task-info"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}{task.dueDate && <span className="task-due">Due {new Date(task.dueDate).toLocaleDateString()}</span>}</div>
                    <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => updateTask(task._id, { status: event.target.value })}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select>
                    <button className="delete-task" aria-label={`Edit ${task.title}`} onClick={() => { setEditingTaskId(task._id); setEditForm({ title: task.title, description: task.description || "", status: task.status, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "" }); }}>✎</button>
                    <button className="delete-task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task._id)}>×</button>
                  </>}
                </article>
              ))}</div>
            )}
          </section>
          <aside className="add-task-card"><div className="create-symbol">＋</div><h2>Add a task</h2><p>Keep it small and doable.</p><form className="form-stack" onSubmit={addTask}><label>Task name<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to be done?" /></label><label>Description <span className="optional">(optional)</span><textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A few helpful details..." /></label><label>Due date <span className="optional">(optional)</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label><button className="button primary full">Add task <span>→</span></button></form></aside>
        </div>
      </section>
      <footer className="app-footer"><span>✦ daymark</span><span>One thing at a time.</span></footer>
    </main>
  );
}
