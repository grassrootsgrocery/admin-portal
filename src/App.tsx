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
import { Dropdown } from "./components/Dropdown";

const l = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface FilterScheduledSlot {
  confirmed: boolean;
  driver: boolean;
  packer: boolean;
  name: string;
}
const filterProps = [
  { label: "Confirmed", filter: (e: FilterScheduledSlot) => e.confirmed },
  {
    label: "Only Driver",
    filter: (e: FilterScheduledSlot) => e.driver && !e.packer,
  },
  {
    label: "Only Packer",
    filter: (e: FilterScheduledSlot) => e.packer && !e.driver,
  },
  {
    label: "Packer & Driver",
    filter: (e: FilterScheduledSlot) => e.packer && e.driver,
  },
];

const ss = [
  { confirmed: true, driver: false, packer: false, name: "Jason" },
  { confirmed: false, driver: false, packer: false, name: "Tim" },
  { confirmed: true, driver: true, packer: false, name: "Grace" },
  { confirmed: true, driver: false, packer: true, name: "Sophie" },
  { confirmed: false, driver: false, packer: false, name: "Surabi" },
  { confirmed: true, driver: false, packer: true, name: "Helen" },
  { confirmed: false, driver: true, packer: false, name: "Arin" },
  { confirmed: true, driver: false, packer: false, name: "Jacob" },
  { confirmed: false, driver: false, packer: false, name: "Rae" },
  { confirmed: true, driver: true, packer: false, name: "Andrew" },
  { confirmed: false, driver: true, packer: true, name: "Vibhu" },
  { confirmed: false, driver: false, packer: false, name: "Sadena" },
  { confirmed: true, driver: true, packer: true, name: "Pallavi" },
];
function App() {
  // Label -> Packers
  // filter -> () => {}
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen flex-col  rounded border">
            <Navbar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<ViewEvent />} />
              <Route
                path="/dropdown"
                element={<Dropdown filterProps={filterProps} ss={ss} />}
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
