import { Router } from "express";
import controller from "../controllers/linksController";

const router = Router();

router.post("/create", controller.createLink);
router.delete("/delete", controller.deleteLink);
router.get("/list", controller.getLinks);

export default router;
