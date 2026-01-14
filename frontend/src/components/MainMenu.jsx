const MainMenu = ({ createGame, joinGame }) => {
    return (
        <div className="main-menu">
            <h1>ShitPants Game</h1>
            <button onClick={createGame}>Create Game</button>
            <button onClick={joinGame}>Join Game</button>
        </div>
    );
}   

export default MainMenu;