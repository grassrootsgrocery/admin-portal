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
import { Toaster } from "react-hot-toast";
//Pages
import { Login } from "./pages/Login";
import { Events } from "./pages/Events";
import { ViewEvent } from "./pages/ViewEvent";
import { DriverLocationInfo } from "./pages/DriverLocationInfo";

import { Dropdown } from "./components/SpecialGroupDropdown";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen flex-col">
            <Toaster />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<ViewEvent />} />
              <Route
                path="/events/driver-location-info/:eventId"
                element={<DriverLocationInfo />}
              />
              <Route
                path="/events/add-special-group/:eventId"
                element={<Dropdown />}
              />
            </Routes>
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
