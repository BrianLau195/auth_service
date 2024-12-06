import { Request, Response, NextFunction } from "express";
import UserDevice from "../models/userDevice";

export const userDeviceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceToken = req.headers["device-token"];
    const deviceName = req.headers["device-name"];
    const platform = req.headers["platform"];
    const osVersion = req.headers["os-version"];
    const appVersion = req.headers["app-version"];
    const appBuild = req.headers["app-build"];

    if (!deviceToken) {
      return res.status(400).json({ error: "Device token is required" });
    }

    // Find or create the UserDevice record
    const [userDevice] = await UserDevice.findOrBuild({
      where: {
        deviceToken: deviceToken.toString(),
      },
      defaults: {
        deviceName: deviceName?.toString(),
        platform: platform?.toString(),
        osVersion: osVersion?.toString(),
        appVersion: appVersion?.toString(),
        appBuild: appBuild?.toString(),
        deviceToken: deviceToken.toString(),
      },
    });

    // Attach the userDevice to the request object for use in subsequent middleware/routes
    req.userDevice = userDevice;

    next();
  } catch (error) {
    console.error("User device middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

declare global {
  namespace Express {
    interface Request {
      userDevice: UserDevice;
    }
  }
}
