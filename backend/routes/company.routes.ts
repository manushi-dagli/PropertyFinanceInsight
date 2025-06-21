import { Router } from "express";
import { createCompanyController, deleteCompanyController, getCompanyListController, updateCompanyController } from "../controllers/company.controller";
import { asyncErrorHandler } from "../middleware/error.handler";

const router = Router();

// Get company list router
router.get("/", asyncErrorHandler(getCompanyListController));

router.post("/", asyncErrorHandler(createCompanyController));

router.put("/:companyId", asyncErrorHandler(updateCompanyController));

router.delete("/:companyId", asyncErrorHandler(deleteCompanyController));

export default router;
