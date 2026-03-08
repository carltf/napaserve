import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
import Hub from "./napaserve-hub";
import Dashboard from "./napa-economic-pulse-full-3";
import Evaluator from "./napaserve-project-evaluator";
import EventFinder from "./napaserve-event-finder";
import News from "./napaserve-napa-valley-features";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluator" element={<Evaluator />} />
        <Route path="/events" element={<EventFinder />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </BrowserRouter>
  );
}
