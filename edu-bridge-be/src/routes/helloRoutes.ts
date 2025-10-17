import { Router } from "express";
import { getHello } from "../controllers/helloController.ts";

const router = Router();

router.get("/hello", getHello);

export default router;
