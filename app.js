import express from "express";
import gameRouter from "./controllers/gameController.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/game", gameRouter);

export default app;