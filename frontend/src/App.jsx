import { useState } from 'react'
import MainMenu from './components/MainMenu'
import CreateGame from './components/CreateGame'
import Lobby from './components/Lobby'
import FindGame from './components/FindGame'
import Game from './components/Game'

function App() {
  const [appState, setAppState] = useState('MAIN_MENU')

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

  return (
    <div className="App">
      {appState === 'MAIN_MENU' && <MainMenu createGame={goToCreateGame} joinGame={goToJoinGame}/>}
      {appState === 'CREATE_GAME' && <CreateGame joinLobby={goToLobby}/>}
      {appState === 'LOBBY' && <Lobby findGame={goToFindGame}/>}
      {appState === 'FIND_GAME' && <FindGame joinLobby={goToLobby} mainMenu={goToMainMenu} createGame={goToCreateGame}/>}
      {appState === 'GAME' && <Game />}
    </div>
  )
}

export default App
