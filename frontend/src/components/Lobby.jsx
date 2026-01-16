const Lobby = ({ goToJoinGame, lobbyInfo }) => {
  return (
    <div>
        <h1>Lobby</h1>
        <p>Game ID: {lobbyInfo?.id}</p>
        <p>Game Name: {lobbyInfo?.name}</p>
        <p>Password: {lobbyInfo?.password}</p>

        <h2>Players in Lobby</h2>
        <p>...</p>
    </div>
  );
}

export default Lobby;