const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];
let activities = [];

const createActivity = (type, task) => {
  activities.unshift({
    id: Date.now() + Math.random(),
    type,
    taskId: task.id,
    title: task.title,
    timestamp: new Date().toISOString(),
  });
};

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/activities", (req, res) => {
  res.json(activities);
});

app.post("/tasks", (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  const now = new Date().toISOString();
  const task = {
    id: Date.now(),
    title,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  createActivity("added", task);

  res.json(task);
});

app.put("/tasks/:id", (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  let updatedTask = null;
  tasks = tasks.map((t) => {
    if (t.id == req.params.id) {
      updatedTask = {
        ...t,
        title,
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  createActivity("updated", updatedTask);

  res.json({ message: "Updated" });
});

app.delete("/tasks/:id", (req, res) => {
  const taskToDelete = tasks.find((t) => t.id == req.params.id);
  if (!taskToDelete) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks = tasks.filter((t) => t.id != req.params.id);
  createActivity("deleted", taskToDelete);

  res.json({ message: "Deleted" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});