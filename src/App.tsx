import React from "react";
import { app } from "./firebaseConfig";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 180 } },
}); //Set staleTime to 3 minutes since this is not the kind of application that needs to refetch data very often

//Components
import { Navbar } from "./components/Navbar/Navbar";
//Pages
import { Login } from "./pages/Login";
import { Events } from "./pages/Events/Events";
import { ViewEvent } from "./pages/Events/ViewEvent";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div className="h-screen border rounded border-red-500 flex flex-col">
            <Navbar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<ViewEvent />} />
            </Routes>
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
