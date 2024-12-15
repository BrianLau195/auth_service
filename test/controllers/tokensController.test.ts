import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/user";
import UserDevice from "../../src/models/userDevice";
import RefreshToken from "../../src/models/refreshToken";
import { sequelize } from "../../src/models";
import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";

describe("Tokens Controller", () => {
  let user: User;
  let userDevice: UserDevice;
  let refreshToken: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
    await RefreshToken.destroy({ truncate: true });
    await UserDevice.destroy({ truncate: true });

    // Create test user
    user = await User.create({
      email: "test@example.com",
      password: "password123",
    });

    // Create user device
    userDevice = await UserDevice.create({
      userId: user.id,
      deviceToken: "test-device-token",
    });

    // Generate refresh token
    refreshToken = await user.generateRefreshToken(userDevice);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("refresh", () => {
    it("should generate new access token with valid refresh token", async () => {
      const response = await request(app)
        .get("/tokens/refresh")
        .set("device-token", "test-device-token")
        .set("refresh", `${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Token refreshed successfully",
      });
      expect(response.headers["authorization"]).toBeDefined();
      expect(response.headers["refresh"]).toBeDefined();
    });

    it("should return error with invalid refresh token", async () => {
      const response = await request(app)
        .get("/tokens/refresh")
        .set("device-token", "test-device-token")
        .set("refresh", "invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid refresh token" });
    });

    it("should return error with missing refresh token", async () => {
      const response = await request(app)
        .get("/tokens/refresh")
        .set("device-token", "test-device-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid refresh token" });
    });

    it("should return error with mismatched device token", async () => {
      const response = await request(app)
        .get("/tokens/refresh")
        .set("device-token", "wrong-device-token")
        .set("refresh", `${refreshToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid refresh token" });
    });
  });
});
