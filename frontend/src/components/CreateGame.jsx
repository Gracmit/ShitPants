import { useState } from "react";
import gameService from '../services/game.js';
const CreateGame = ({ joinLobby, userName, setLobbyInfo }) => {
    const [gameName, setGameName] = useState("");
    const [password, setPassword] = useState("");
    const [numPlayers, setNumPlayers] = useState(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const gameData = {
            gameName,
            password,
            numPlayers,
            playerName: userName
        }

        const data = await gameService.createGame(gameData);
        console.log("Game created:", data);
        setLobbyInfo({id: data.id, name: data.name, password: data.password});
        joinLobby();
    };

    return (
        <div>
            <h2>Create Game</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Game Name:</label>
                    <input type="text" name="gameName" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="text" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                    <label>Number of players:</label>
                    <input type="number" name="numPlayers" min={2} max={5} value={numPlayers} onChange={(e) => setNumPlayers(e.target.value)} />
                </div>

                <button type="submit">Create Game</button>
            </form>
        </div>
    );
}
export default CreateGame;