import { useState } from "react";
import gameService from '../services/game.js';

const CreateGame = ({ joinLobby, userName, setLobbyInfo, mainMenu }) => {
    const [gameName, setGameName] = useState("");
    const [password, setPassword] = useState("");
    const [numPlayers, setNumPlayers] = useState(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const gameData = { gameName, password, numPlayers, playerName: userName };
        const data = await gameService.createGame(gameData);
        setLobbyInfo({ id: data.id, name: data.name, password: data.password });
        joinLobby();
    };

    return (
        <div className="panel">
            <div className="card">
                <h2>Create Game</h2>
                <form onSubmit={handleSubmit} className="form-row">
                    <label>Game Name:</label>
                    <input className="input" type="text" name="gameName" value={gameName} onChange={(e) => setGameName(e.target.value)} />

                    <label>Password:</label>
                    <input className="input" type="text" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <label>Number of players:</label>
                    <input className="input" type="number" name="numPlayers" min={2} max={5} value={numPlayers} onChange={(e) => setNumPlayers(Number(e.target.value))} />

                    <div style={{display:'flex',gap:8}}>
                        <button className="btn primary" type="submit">Create Game</button>
                        <button className="btn" type="button" onClick={mainMenu}>Back to Main Menu</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default CreateGame;