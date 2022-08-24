import express, { Request, Response } from "express";
import userRoutes from './user.routes';
import enumRoutes from './enum.routes';

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  return res.end('User CRUD Application is up');
});
router.use('/api/v1/user', userRoutes)
router.use('/api/v1/enums', enumRoutes)
export default router;
