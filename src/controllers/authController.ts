import { Request, Response } from "express";
import User from "../models/user";

const signup = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const newUser = User.build({ email, password, firstName, lastName });
    await newUser.save();
    const userDevice = req.userDevice;
    userDevice.userId = newUser.id;
    await userDevice.save();
    const accessToken = await newUser.generateToken(userDevice, "access");
    const refreshToken = await newUser.generateToken(userDevice, "refresh");
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("Refresh", `${refreshToken}`);
    res.status(201).json({ message: "User created successfully" });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const VERIFICATION_TIME = 300;

  // Prevent timing attacks
  async function processTime() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), VERIFICATION_TIME);
    });
  }

  const dummyPromise = processTime();
  const user = await User.findOne({ where: { email } });
  const isValid = (await user?.verifyPassword(password)) ?? false;

  if (isValid && user) {
    const userDevice = req.userDevice;
    const accessToken = await user.generateToken(userDevice, "access");
    const refreshToken = await user.generateToken(userDevice, "refresh");
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("Refresh", `${refreshToken}`);
    await dummyPromise;
    res.status(200).json({ message: "User logged in successfully" });
  } else {
    await dummyPromise;
    res.status(400).json({ message: "Invalid credentials" });
  }
};

export default { signup, login };
