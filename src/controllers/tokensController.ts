import { Request, Response } from "express";
import RefreshToken from "../models/refreshToken";

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.headers["refresh"];
  const userDevice = req.userDevice;
  if (userDevice) {
    const tokens = await userDevice.getRefreshTokens({
      order: [["createdAt", "DESC"]],
      limit: 1,
    });
    const validToken = tokens[0]?.validateToken(refreshToken as string);

    if (validToken) {
      const user = await userDevice.getUser();
      const accessToken = await user.generateToken(userDevice, "access");
      const newRefreshToken = await user.generateToken(userDevice, "refresh");
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
};

export default { refresh };
