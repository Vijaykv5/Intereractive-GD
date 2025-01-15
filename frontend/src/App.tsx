import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/Landing";
import TopicPage from "./components/Topic";
import Video from "./components/VideoElement/Video";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/topic" element={<TopicPage />} />
        <Route path="/video" element={<Video />} />
      </Routes>
    </Router>
  );
};

export default App;
