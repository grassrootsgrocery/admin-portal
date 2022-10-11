import { useState } from 'react'
import { app } from "./firebaseConfig";
import { AuthProvider } from "./contexts/AuthContext";

import './App.css'

function App() {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
  console.log(apiKey);

  return (
    <AuthProvider>
      <div className="App"></div>
    </AuthProvider>
  )
}

export default App
