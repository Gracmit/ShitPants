import { useState } from 'react'
import MainMenu from './components/MainMenu'
import CreateGame from './components/CreateGame'
import Lobby from './components/Lobby'
import FindGame from './components/FindGame'
import Game from './components/Game'

function App() {
  const [appState, setAppState] = useState('MAIN_MENU')
  const [userName, setUserName] = useState(null)
  const [lobbyInfo, setLobbyInfo] = useState(null)

  const goToCreateGame = () => {
    setAppState('CREATE_GAME')
  }

  const goToLobby = () => {
    setAppState('LOBBY')
  }

  const goToGame = () => {
    setAppState('GAME')
  }

  const goToFindGame = () => {
    setAppState('FIND_GAME')
  }

  const goToMainMenu = () => {
    setAppState('MAIN_MENU')
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
      {appState === 'CREATE_GAME' && <CreateGame joinLobby={goToLobby} userName={userName} setLobbyInfo={setNewLobbyInfo}/>}
      {appState === 'LOBBY' && <Lobby findGame={goToFindGame} goToGame={goToGame} lobbyInfo={lobbyInfo}/>}
      {appState === 'FIND_GAME' && <FindGame joinLobby={goToLobby} mainMenu={goToMainMenu} createGame={goToCreateGame} setLobbyInfo={setNewLobbyInfo}/>}
      {appState === 'GAME' && <Game />}
    </div>
  )
}

export default App
