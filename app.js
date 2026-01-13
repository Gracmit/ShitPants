import express from "express";
import gameRouter from "./controllers/gameController.js";

const app = express();

app.use(express.json());

app.use("/game", gameRouter);

export default app;