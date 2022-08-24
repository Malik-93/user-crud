import express, { Request, Response } from "express";
import EnumController from "../controllers/enum.controller";
const router = express.Router();
router.get("/", (_req: Request, res: Response) => {
    const enumsController = new EnumController();
    const enums = enumsController.getEnums();
    return res.status(200).json({ enums });

});
export default router;
