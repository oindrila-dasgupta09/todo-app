const pool = require("../db");

const getTasks = async (req, res) => {
  try {

    const userId = req.user.id;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.status(200).json({
      success: true,
      tasks: tasks.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

const createTask = async (req, res) => {
  try {

    const { title, completed, status, priority } = req.body;

    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title required",
      });
    }

    const taskCompleted = typeof completed === "boolean" ? completed : false;
    const taskStatus = status || (taskCompleted ? "completed" : "pending");
    const taskPriority = priority || "medium";

    const newTask = await pool.query(
      `INSERT INTO tasks
      (title, completed, status, priority, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [
        title,
        taskCompleted,
        taskStatus,
        taskPriority,
        userId,
      ]
    );

    res.status(201).json({
      success: true,
      task: newTask.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};

const updateTask = async (req, res) => {
  try {
    const { title, completed, status, priority } = req.body;
    const userId = req.user.id;
    const taskId = req.params.id;

    const existingTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const currentTask = existingTask.rows[0];
    const updatedTitle = title || currentTask.title;
    const updatedCompleted = typeof completed === "boolean" ? completed : currentTask.completed;
    const updatedStatus = status || (updatedCompleted ? "completed" : currentTask.status || "pending");
    const updatedPriority = priority || currentTask.priority || "medium";

    const updatedTask = await pool.query(
      `UPDATE tasks SET title = $1, completed = $2, status = $3, priority = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [updatedTitle, updatedCompleted, updatedStatus, updatedPriority, taskId, userId]
    );

    res.status(200).json({
      success: true,
      task: updatedTask.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const deleted = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [taskId, userId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};