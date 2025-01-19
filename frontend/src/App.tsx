import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/Landing";
import TopicPage from "./components/Topic";
import Video from "./components/VideoElement/Video";
import SendData from "./components/SendData";
import SignIn from "./components/SignIn";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/topic" element={<TopicPage />} />
        <Route path="/video" element={<Video />} />
        <Route path="/sendData" element={<SendData />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
};

export default App;
