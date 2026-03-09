import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Hub from "./napaserve-hub";
import Dashboard from "./napa-economic-pulse-full-3";
import Evaluator from "./napaserve-project-evaluator";
import EventFinder from "./napaserve-event-finder";
import News from "./napaserve-napa-valley-features";
import ValleyWorks from "./napaserve-valley-works";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}>
        <NavBar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Hub />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evaluator" element={<Evaluator />} />
            <Route path="/events" element={<EventFinder />} />
            <Route path="/news" element={<News />} />
            <Route path="/valley-works" element={<ValleyWorks />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
