const GameCreator = () => {
    return (
        <div>
            <h1>Create a New Game</h1>
            <form>
                <label>
                    Game Name:
                    <input type="text" name="gameName" />
                </label>
                <br />
                <label>
                    Password:
                    <input type="text" name="password" />
                </label>
                <br />
                <label>
                    Max Players:
                    <input type="number" name="maxPlayers" min="2" max="10" />
                </label>
                <br />

                <button type="submit">Create Game</button>
            </form>
        </div>
    )
}