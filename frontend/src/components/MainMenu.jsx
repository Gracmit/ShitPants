import { useState } from "react";

const MainMenu = ({ createGame, findGame, setUserName, userName }) => {
    const [name, setName] = useState("");

    const handleButtonClick = () => {
        if (name.trim() !== "") {
            setUserName(name);
        }
    };
    return (
        <div>
            {!userName && <div>
                <input type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
                <button onClick={handleButtonClick}>Set Name</button>
            </div>
            }
            {userName && <div className="main-menu">
                <h1>ShitPants Game</h1>
                <button onClick={createGame}>Create Game</button>
                <button onClick={findGame}>Find Game</button>
            </div>
            }
        </div>
    );
}

export default MainMenu;