import socket from './services/socket.tsx'
import MainMenu from './components/MainMenu.tsx'
import { useEffect } from 'react'

const App = () => {

  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  })
  return (
    <div>
      <MainMenu />
    </div>
  )
}

export default App
