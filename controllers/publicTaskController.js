const pool = require("../db");

const getUserByEmail = async (email) => {
  const result = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  return result.rows[0] || null;
};

const getPublicTasks = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email query parameter is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id]
    );

    return res.json(tasks.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createPublicTask = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const { title, completed, status, priority } = req.body;
    if (!email || !title) {
      return res.status(400).json({ success: false, message: "Email and title are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const taskStatus = status || (completed ? "completed" : "pending");
    const taskCompleted = typeof completed === "boolean" ? completed : false;
    const taskPriority = priority || "medium";

    const newTask = await pool.query(
      `INSERT INTO tasks (title, completed, status, priority, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [title, taskCompleted, taskStatus, taskPriority, user.id]
    );

    return res.status(201).json(newTask.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updatePublicTask = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const { title, completed, status, priority } = req.body;
    const taskId = req.params.id;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const currentTask = existing.rows[0];
    const taskTitle = title || currentTask.title;
    const taskCompleted = typeof completed === "boolean" ? completed : currentTask.completed;
    const taskStatus = status || (taskCompleted ? "completed" : currentTask.status || "pending");
    const taskPriority = priority || currentTask.priority || "medium";

    const updatedTask = await pool.query(
      `UPDATE tasks SET title = $1, completed = $2, status = $3, priority = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [taskTitle, taskCompleted, taskStatus, taskPriority, taskId, user.id]
    );

    return res.json(updatedTask.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deletePublicTask = async (req, res) => {
  try {
    const email = req.body.email || req.query.email;
    const taskId = req.params.id;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const deleted = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [taskId, user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getPublicTasks,
  createPublicTask,
  updatePublicTask,
  deletePublicTask,
};
