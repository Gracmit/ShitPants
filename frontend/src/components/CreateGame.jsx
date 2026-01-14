import { useState } from "react";
const CreateGame = ({ joinLobby }) => {
    const [gameName, setGameName] = useState("");
    const [password, setPassword] = useState("");
    const [numPlayers, setNumPlayers] = useState(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Creating game with details:", { gameName, password, numPlayers });
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