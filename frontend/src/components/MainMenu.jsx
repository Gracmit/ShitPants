import { useState } from "react";

const MainMenu = ({ createGame, findGame, setUserName, userName }) => {
    const [name, setName] = useState("");

    const handleButtonClick = () => { if (name.trim() !== "") setUserName(name); };
    const handleKeyPress = (e) => { if (e.key === "Enter" && name.trim() !== "") setUserName(name); };

    return (
        <div className="panel">
            {!userName && (
                <div className="card form-row">
                    <input className="input" type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} onKeyUp={handleKeyPress} />
                    <button className="btn primary" onClick={handleButtonClick}>Set Name</button>
                </div>
            )}

            {userName && (
                <div className="main-menu card">
                    <h1>ShitPants Game</h1>
                    <button className="btn primary" onClick={createGame}>Create Game</button>
                    <button className="btn" onClick={findGame}>Find Game</button>
                </div>
            )}
        </div>
    );
}

export default MainMenu;