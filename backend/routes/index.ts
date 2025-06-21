import { Router } from 'express';
import companyRoutes from './company.routes';
import healthcheckRoutes from './healthcheck.routes';

const router = Router();

router.use('/company', companyRoutes);
router.use('/', healthcheckRoutes);

export default router;