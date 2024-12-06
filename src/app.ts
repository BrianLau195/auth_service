import express, { Application, RequestHandler } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import http from "http";
import router from "./routes.js";
import { userDeviceMiddleware } from "./middlewares/userDeviceMiddleware.js";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(morgan("dev"));
app.use(userDeviceMiddleware as RequestHandler);
app.use("/", router);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
