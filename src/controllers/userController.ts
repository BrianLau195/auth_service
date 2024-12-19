import { Request, Response } from "express";
import User from "../models/user";

const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const updatedUser = await User.update(
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
      { where: { id: userId } },
    );

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["hashedPassword", "uuid", "createdAt", "updatedAt"],
      },
    });

    res.status(200).json({
      message: "User details updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserDetails = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["hashedPassword", "uuid", "createdAt", "updatedAt"],
    },
  });
  res.status(200).json({ user });
};

export default { updateUserDetails, getUserDetails };
