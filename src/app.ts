import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import User from "./models/user.js";
import morgan from "morgan";
import http from "http";
import UserDevice from "./models/userDevice.js";
import RefreshToken from "./models/refreshToken.js";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(morgan("dev"));

const server = http.createServer(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.post("/signup", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const newUser = User.build({ email, password, firstName, lastName });
    await newUser.save();
    const accessToken = await newUser.generateToken("access");
    const refreshToken = await newUser.generateToken("refresh");
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("Refresh", `${refreshToken}`);
    res.status(201).json({ message: "User created successfully" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const VERIFICATION_TIME = 300;

  async function processTime() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), VERIFICATION_TIME);
    });
  }

  const dummyPromise = processTime();
  const user = await User.findOne({ where: { email } });
  const isValid = (await user?.verifyPassword(password)) ?? false;

  if (isValid && user) {
    const accessToken = await user.generateToken("access");
    const refreshToken = await user.generateToken("refresh");
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("Refresh", `${refreshToken}`);
    await dummyPromise;
    res.status(200).json({ message: "User logged in successfully" });
  } else {
    await dummyPromise;
    res.status(400).json({ message: "Invalid credentials" });
  }
});

app.post("/refresh", async (req: Request, res: Response) => {
  const { deviceToken, refreshToken } = req.headers;
  const userDevice = await UserDevice.findOne({ where: { deviceToken } });
  if (userDevice) {
    const tokens = await userDevice.getRefreshTokens({
      order: [["createdAt", "DESC"]],
      limit: 1,
    });
    const validToken = tokens[0]?.validateToken(refreshToken as string);

    if (validToken) {
      const user = await userDevice.getUser();
      const accessToken = await user.generateToken("access");
      const newRefreshToken = await user.generateToken("refresh");
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.setHeader("Refresh", `${newRefreshToken}`);
      res.status(200).json({ message: "Token refreshed successfully" });
    } else {
      const token = await RefreshToken.findByToken(refreshToken as string);
      if (token) {
        // old token passed, may had been compromised, delete all tokens
        await userDevice.removeRefreshTokens();
      }
      res.status(401).json({ message: "Invalid refresh token" });
    }
  } else {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
