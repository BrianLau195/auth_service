import { Router } from "express";
import authController from "./controllers/authController.js";
import tokensController from "./controllers/tokensController.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", tokensController.refresh);

export default router;
