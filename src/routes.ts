import { Router } from "express";
import authController from "./controllers/authController";
import tokensController from "./controllers/tokensController";
import userController from "./controllers/userController";

const router = Router();

router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);

router.get("/tokens/refresh", tokensController.refresh);

router.put("/user", userController.updateUserDetails);
router.get("/user", userController.getUserDetails);

export default router;
