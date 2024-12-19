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

describe("Auth Controller", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("signup", () => {
    it("should create a new user when email doesn't exist", async () => {
      const response = await request(app)
        .post("/auth/signup")
        .set("device-token", "test")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "User created successfully" });
      expect(response.headers["authorization"]).toBeDefined();

      const user = await User.findOne({ where: { email: "test@example.com" } });
      expect(user).not.toBeNull();
      expect(user?.email).toBe("test@example.com");
    });

    it("should return error when user already exists", async () => {
      await User.create({
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app)
        .post("/auth/signup")
        .set("device-token", "test")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User already exists" });
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await User.create({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("device-token", "test")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User logged in successfully" });
      expect(response.headers["authorization"]).toBeDefined();
    });

    it("should return error with invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("device-token", "test")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });

    it("should return error when user not found", async () => {
      const response = await request(app)
        .post("/auth/login")
        .set("device-token", "test")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });
  });
});
