import { useState } from 'react'
import './App.css'

function App() {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
  console.log(apiKey);

  return (
    <div className="App"></div>
  )
}

export default App
