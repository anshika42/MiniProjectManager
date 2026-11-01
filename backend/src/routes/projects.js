const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");

const router = express.Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description = "" } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Project title is required." });
    }
    const project = await Project.create({ title: title.trim(), description, user: req.userId });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId", async (req, res, next) => {
  try {
    if (!validId(req.params.projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }
    const project = await Project.findOne({ _id: req.params.projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch("/:projectId", async (req, res, next) => {
  try {
    if (!validId(req.params.projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }
    const updates = {};
    if (typeof req.body.title === "string" && req.body.title.trim()) updates.title = req.body.title.trim();
    if (typeof req.body.description === "string") updates.description = req.body.description;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete("/:projectId", async (req, res, next) => {
  try {
    if (!validId(req.params.projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }
    const project = await Project.findOneAndDelete({ _id: req.params.projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json({ message: "Project deleted." });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/tasks", async (req, res, next) => {
  try {
    const { title, description = "", status = "todo", dueDate = null } = req.body;
    if (!validId(req.params.projectId)) {
      return res.status(400).json({ message: "Invalid project ID." });
    }
    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }
    const project = await Project.findOne({ _id: req.params.projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    project.tasks.push({ title: title.trim(), description, status, dueDate: dueDate || null });
    await project.save();
    res.status(201).json(project.tasks[project.tasks.length - 1]);
  } catch (error) {
    next(error);
  }
});

router.patch("/:projectId/tasks/:taskId", async (req, res, next) => {
  try {
    if (!validId(req.params.projectId) || !validId(req.params.taskId)) {
      return res.status(400).json({ message: "Invalid project or task ID." });
    }
    const project = await Project.findOne({ _id: req.params.projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ message: "Task title cannot be empty." });
      }
      task.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || null;
    await project.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete("/:projectId/tasks/:taskId", async (req, res, next) => {
  try {
    if (!validId(req.params.projectId) || !validId(req.params.taskId)) {
      return res.status(400).json({ message: "Invalid project or task ID." });
    }
    const project = await Project.findOne({ _id: req.params.projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    task.deleteOne();
    await project.save();
    res.json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
