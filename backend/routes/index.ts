import { Router } from 'express';
import companyRoutes from './companyRoute';
import healthcheckRoutes from './healthcheckRoute';

const router = Router();

router.use('/company', companyRoutes);
router.use('/', healthcheckRoutes);

export default router;