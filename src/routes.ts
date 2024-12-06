import { Router } from "express";
import authController from "./controllers/authController";
import tokensController from "./controllers/tokensController";

const router = Router();

router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);

router.post("/tokens/refresh", tokensController.refresh);

export default router;
