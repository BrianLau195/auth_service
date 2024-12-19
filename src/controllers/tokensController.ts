import { Request, Response } from "express";
import RefreshToken from "../models/refreshToken";
import User from "../models/user";

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.headers["refresh"];
  const userDevice = req.userDevice;
  if (userDevice && refreshToken) {
    const tokens = await RefreshToken.findAll({
      where: {
        userDeviceId: userDevice.id,
      },
      order: [["createdAt", "DESC"]],
      limit: 1,
    });
    const validToken = tokens[0]?.validateToken(refreshToken as string);

    if (validToken) {
      const user = await User.findByPk(userDevice.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const accessToken = await user.generateAccessToken();
      const newRefreshToken = await user.generateRefreshToken(userDevice);
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.setHeader("Refresh", `${newRefreshToken}`);
      res.status(200).json({ message: "Token refreshed successfully" });
    } else {
      const token = await RefreshToken.findByToken(refreshToken as string);
      if (token) {
        // old token passed, may had been compromised, delete all tokens
        await RefreshToken.destroy({
          where: {
            userDeviceId: userDevice.id,
          },
        });
      }
      res.status(401).json({ error: "Invalid refresh token" });
    }
  } else {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export default { refresh };
