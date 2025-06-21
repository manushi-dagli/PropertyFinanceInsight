import { Router } from "express";
import { asyncErrorHandler } from "../middleware/error.handler";
import {
  getProjectListController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller";

const router = Router();

router.get("/", asyncErrorHandler(getProjectListController));

router.post("/", asyncErrorHandler(createProjectController));

router.put("/:projectId", asyncErrorHandler(updateProjectController));

router.delete("/:projectId", asyncErrorHandler(deleteProjectController));

export default router;