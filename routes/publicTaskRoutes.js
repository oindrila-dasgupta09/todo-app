const express = require("express");
const router = express.Router();

const {
  getPublicTasks,
  createPublicTask,
  updatePublicTask,
  deletePublicTask,
} = require("../controllers/publicTaskController");

router.get("/", getPublicTasks);
router.post("/", createPublicTask);
router.put("/:id", updatePublicTask);
router.delete("/:id", deletePublicTask);

module.exports = router;
