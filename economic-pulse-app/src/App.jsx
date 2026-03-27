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
import UnderTheHoodIndex from "./under-the-hood-index";
import UnderTheHoodArticle from "./napaserve-under-the-hood-v2";
import UnderTheHoodSonoma from "./under-the-hood-sonoma";
import UnderTheHoodLake from "./under-the-hood-lake";
import UnderTheHoodGDP from "./under-the-hood-gdp-2024";
import UnderTheHoodSupplyChain from "./napaserve-under-the-hood-supply-chain";
import NapaServeAdmin from "./napaserve-admin";
import DigestCuration from "./DigestCuration";

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
        <Route path="/under-the-hood/sonoma-cab-2025" element={<UnderTheHoodSonoma />} />
        <Route path="/under-the-hood/lake-county-cab-2025" element={<UnderTheHoodLake />} />
        <Route path="/under-the-hood/napa-gdp-2024" element={<UnderTheHoodGDP />} />
        <Route path="/under-the-hood/napa-supply-chain-2026" element={<UnderTheHoodSupplyChain />} />
        <Route path="/events/digest" element={<DigestCuration />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<NapaServeAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
