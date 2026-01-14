import express from "express";
import { gameStore } from "../stores/game.stores.js";
import setup from "../game/setup.js";

const gameRouter = express.Router();

gameRouter.post("/create", (req, res) => {
    const gameName = req.body.gameName;
    const password = req.body.password;
    const numPlayers = req.body.numPlayers;
    const playerName = req.body.playerName;
    const newGame = setup.createGame(gameName, password, numPlayers, playerName);
    gameStore.create(newGame);
    res.status(201).json(newGame);
});

gameRouter.get("/status/:id", (req, res) => {
    const game = gameStore.get(req.params.id);
    if (game) {
        res.json(game);
    } else {
        res.status(404).json({ message: "Game not found" });
    }
});

gameRouter.put("/:id", (req, res) => {
    const playerId = req.body.playerId;
    const gameId = req.params.id;
    const game = gameStore.get(gameId);
    const updatedGame = setup.addPlayerToGame(game, playerId);
    gameStore.update(gameId, updatedGame);
    res.json(updatedGame);
});

export default gameRouter;