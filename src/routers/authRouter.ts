import { Router } from "express";
import controller from "../controllers/authController";

const router = Router();

router.post("/sign-up", controller.registration);
router.post("/sign-in", controller.login);

export default router;
