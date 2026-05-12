
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

    const { title, status, priority } = req.body;

    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title required",
      });
    }

    const newTask = await pool.query(
      `INSERT INTO tasks
      (title, status, priority, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        title,
        status || "pending",
        priority || "medium",
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

// =========================
// UPDATE TASK
// =========================

const updateTask = async (req, res) => {
  try {

    const { id } = req.params;

    const { title, completed } = req.body;

    const updatedTask = await pool.query(
      `UPDATE tasks
       SET title = $1,
       completed = $2,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [
        title,
        completed || false,
        id,
      ]
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

// =========================
// DELETE TASK
// =========================

const deleteTask = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

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
