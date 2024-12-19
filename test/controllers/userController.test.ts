import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/user";
import { sequelize } from "../../src/models";
import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";

describe("User Controller", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });

    // Create a test user and get auth token
    const signupResponse = await request(app)
      .post("/auth/signup")
      .set("device-token", "test-device")
      .send({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });

    authToken = signupResponse.headers["authorization"];
    const user = await User.findOne({ where: { email: "test@example.com" } });
    userId = user!.id.toString();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("updateUserDetails", () => {
    it("should update user details successfully", async () => {
      const response = await request(app)
        .put("/user")
        .set("Authorization", authToken)
        .set("device-token", "test-device")
        .send({
          firstName: "Updated",
          lastName: "Name",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "User details updated successfully",
      );
      expect(response.body.user).toBeDefined();

      const updatedUser = await User.findByPk(userId);
      expect(updatedUser?.firstName).toBe("Updated");
      expect(updatedUser?.lastName).toBe("Name");
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .put("/user")
        .set("device-token", "test-device")
        .send({
          firstName: "Updated",
          lastName: "Name",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    it("should keep the original values if the new values are invalid", async () => {
      const response = await request(app)
        .put("/user")
        .set("Authorization", authToken)
        .set("device-token", "test-device")
        .send({
          firstName: "", // Invalid empty name
          lastName: "Name",
        });

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe("Test");
      expect(response.body.user.lastName).toBe("Name");
    });

    it("should update only provided fields", async () => {
      const response = await request(app)
        .put("/user")
        .set("Authorization", authToken)
        .set("device-token", "test-device")
        .send({
          firstName: "UpdatedFirst",
        });

      expect(response.status).toBe(200);

      const updatedUser = await User.findByPk(userId);
      expect(updatedUser?.firstName).toBe("UpdatedFirst");
      expect(updatedUser?.lastName).toBe("User"); // Original last name unchanged
    });
  });

  describe("getUserDetails", () => {
    it("should return user details", async () => {
      const response = await request(app)
        .get("/user")
        .set("Authorization", authToken)
        .set("device-token", "test-device");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id.toString()).toBe(userId);
      expect(response.body.user.firstName).toBe("Test");
      expect(response.body.user.lastName).toBe("User");
    });
  });
});
