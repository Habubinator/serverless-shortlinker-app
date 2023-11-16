import { Router } from "express";
import controller from "../controllers/redirectController";

const router = Router();

router.get("/:shortlink", controller.redirectToLink);

export default router;
