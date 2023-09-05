import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ThreeScene from './components/ThreeScene';
function App() {
  const [count, setCount] = useState(0)
  console.log("APP")
  return (
    <>
      <div className="app">
      <ThreeScene />
      </div>
    </>
  )
}

export default App
