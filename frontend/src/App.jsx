import { useState, useEffect } from 'react'
import socket from './services/socket.js'
import MainMenu from './components/MainMenu'
import CreateGame from './components/CreateGame'
import Lobby from './components/Lobby'
import FindGame from './components/FindGame'
import Game from './components/Game'

function App() {
  const [appState, setAppState] = useState('MAIN_MENU')
  const [userName, setUserName] = useState(null)
  const [lobbyInfo, setLobbyInfo] = useState(null)

  useEffect(() => {
      socket.connect();

    return () => {
      socket.disconnect()
      localStorage.removeItem("chatMessages");
    }
  }, [])

  const goToCreateGame = () => {
    setAppState('CREATE_GAME')
  }

  const goToLobby = () => {
    setAppState('LOBBY')
  }

  const goToGame = (gameState) => {
    setLobbyInfo(gameState);
    setAppState('GAME')
  }

  const goToFindGame = () => {
    setAppState('FIND_GAME')
    localStorage.removeItem("chatMessages");
  }

  const goToMainMenu = () => {
    setAppState('MAIN_MENU')
    setLobbyInfo(null)
    localStorage.removeItem("chatMessages");
  }

  const setNewUserName = (name) => {
    setUserName(name)
  }

  const setNewLobbyInfo = (info) => {
    setLobbyInfo(info)
  }

  console.log("Rendering App with state:", appState, "and userName:", userName);

  return (
    <div className="App">
      {appState === 'MAIN_MENU' && <MainMenu createGame={goToCreateGame} findGame={goToFindGame} setUserName={setNewUserName} userName={userName}/>}
      {appState === 'CREATE_GAME' && <CreateGame joinLobby={goToLobby} userName={userName} setLobbyInfo={setNewLobbyInfo} mainMenu={goToMainMenu}/>}
      {appState === 'LOBBY' && <Lobby findGame={goToFindGame} goToGame={goToGame} lobbyInfo={lobbyInfo} userName={userName}/>}
      {appState === 'FIND_GAME' && <FindGame joinLobby={goToLobby} mainMenu={goToMainMenu} createGame={goToCreateGame} setLobbyInfo={setNewLobbyInfo}/>}
      {appState === 'GAME' && <Game lobbyInfo={lobbyInfo} userName={userName} goToMainMenu={goToMainMenu} goToLobby={goToLobby} setLobbyData={setNewLobbyInfo}/>}
    </div>
  )
}

export default App
