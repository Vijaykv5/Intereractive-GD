import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from "./components/Landing";
import TopicPage from "./components/Topic";
import Video from "./components/VideoElement/Video";
import SendData from "./components/SendData";
import SignIn from "./components/SignIn";

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="236465284909-ef5p23aaadb9c6qlc5e2t75qmtvh96e9.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/video" element={<Video />} />
          <Route path="/sendData" element={<SendData />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
