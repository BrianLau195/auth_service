import express, { Application, RequestHandler } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import router from "./routes";
import { userDeviceMiddleware } from "./middlewares/userDeviceMiddleware";

dotenv.config();

const app: Application = express();

app.set("port", process.env.PORT || 4000);
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(userDeviceMiddleware as RequestHandler);
app.use("/", router);

export default app;
