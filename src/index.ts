import "dotenv/config";
import serverless from "serverless-http";
import express, { Express, Router } from "express";
import authRouter from "./routers/authRouter";
import linksRouter from "./routers/linksRouter";
import redirectRouter from "./routers/redirectRouter";
import checkToken from "./middleware/checkToken";

const app: Express = express();

app.use(express.json());
app.use(checkToken);

app.use("/auth", authRouter as Router);
app.use("/links", linksRouter as Router);
app.use("/", redirectRouter as Router);

module.exports.app = serverless(app);
