import express, { Request, Response, NextFunction } from "express";
import UserController from "../controllers/user.controller";

const router = express.Router();

router.post("/create-update", async (_req: Request, _res: Response, next: NextFunction) => {
    // console.log('[user.routes]._req.body', _req.body)
    try {
        const controller = new UserController();
        const response = await controller.create_update(_req.body);
        return _res.status(200).json(response);
    } catch (error) {
        return _res.status(500).json(error);
    }

});
router.post("/filter", async (_req: Request, _res: Response, next: NextFunction) => {
    // console.log('[user.routes]._req.body', _req.body)
    try {
        const controller = new UserController();
        const response = await controller.filterUser(_req.body);
        return _res.status(200).json(response);
    } catch (error) {
        return _res.status(500).json(error);

    }
});
router.post("/delete", async (_req: Request, _res: Response, next: NextFunction) => {
    try {
        const controller = new UserController();
        const response = await controller.deleteUser(_req.body);
        return _res.status(200).json(response);
    } catch (error) {
        return _res.status(500).json(error);
    }

});
router.get("/list", async (_req: Request, _res: Response, next: NextFunction) => {
    try {
        const controller = new UserController();
        const response = await controller.getAllUser();
        return _res.status(200).json(response);
    } catch (error) {
        return _res.status(500).json(error);
    }

});

export default router;
