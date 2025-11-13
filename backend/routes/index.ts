import { Router } from 'express';
import companyRoutes from './company.routes';
import healthcheckRoutes from './healthcheck.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use('/', healthcheckRoutes);
router.use('/company', companyRoutes);
router.use('/project', projectRoutes);

export default router;