import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./napaserve-hub";
import Dashboard from "./napa-economic-pulse-full-3";
import Evaluator from "./napaserve-project-evaluator";
import EventFinder from "./napaserve-event-finder";
import News from "./napaserve-napa-valley-features";
import ValleyWorks from "./napaserve-valley-works";
import Archive from "./pages/Archive";
import About from "./napaserve-about";
import VWLabs from "./napaserve-vw-labs";
import UnderTheHoodIndex from "./napaserve-under-the-hood-index";
import UnderTheHoodArticle from "./napaserve-under-the-hood-v2";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluator" element={<Evaluator />} />
        <Route path="/events" element={<EventFinder />} />
        <Route path="/news" element={<News />} />
        <Route path="/valley-works" element={<ValleyWorks />} />
        <Route path="/vw-labs" element={<VWLabs />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/under-the-hood" element={<UnderTheHoodIndex />} />
        <Route path="/under-the-hood/napa-cab-2025" element={<UnderTheHoodArticle />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
