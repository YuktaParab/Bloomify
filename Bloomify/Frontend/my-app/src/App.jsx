import React, { useState } from "react";
import CreatePost from "./components/CreatePost";
import ShowPost from "./components/ShowPost";
import SearchUser from "./components/SearchUser";
import Click from "./components/Click";
import Home from "./components/Home";
import BeginnerMode from "./components/BeginnerMode";
import Login from "./components/Login";
import "./components/Styles.css";
import { TiSocialInstagramCircular } from "react-icons/ti";
import { BsCameraFill } from "react-icons/bs";
import ForgotPassword from "./components/ForgotPassword";
import Signup from "./components/Signup";

const App = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [showClick, setShowClick] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showHome, setShowHome] = useState(true);
  const [showBeginner, setShowBeginner] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [showForgot, setShowForgot] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleCreatePost = () => setShowCreate((prev) => !prev);
  const refreshPosts = () => setRefreshTrigger((prev) => prev + 1);
  const toggleSearchUser = () => setShowSearchUser((prev) => !prev);
  const toggleClick = () => setShowClick((prev) => !prev);

  const handleBeginnerFeature = (feature) => {
    setSelectedFeature(feature);
    setShowBeginner(true);
  };

  return (
    <div className="app-container">

      {/* LOGIN */}
      {showLogin ? (
        <Login
          onLoginSuccess={() => {
            setShowLogin(false);
            setShowHome(false);
          }}
          onForgot={() => {
            setShowLogin(false);
            setShowForgot(true);
          }}
          onSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      ) : showSignup ? (
        <Signup
          onSignupSuccess={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onGoLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      ) : showForgot ? (
        <ForgotPassword
          onBackToLogin={() => {
            setShowForgot(false);
            setShowLogin(true);
          }}
        />
      ) : showBeginner ? (
        <BeginnerMode
          selectedFeature={selectedFeature}
          onBack={() => {
            setShowBeginner(false);
            setSelectedFeature(null);
          }}
        />
      ) : showHome ? (
        <Home
          onEnter={() => setShowHome(false)}
          onBeginnerFeature={handleBeginnerFeature}
          onLogin={() => setShowLogin(true)}
        />
      ) : (
        <>
          {/* MAIN COMMUNITY PAGE */}
          <header className="app-header">
            <h1>
              <span className="Ti">
                <TiSocialInstagramCircular />
              </span>
              <span className="logo">Our Community!!</span>
            </h1>
          </header>

          <main>
            <div className="action-buttons">
              <button className="plus-button" onClick={toggleCreatePost}>+</button>
              <button className="search-user-button" onClick={toggleSearchUser}>🔍</button>
              <button className="camera-button" onClick={toggleClick}>
                <BsCameraFill />
              </button>
            </div>

            {showCreate && <CreatePost setRefreshTrigger={setRefreshTrigger} />}
            {showSearchUser && <SearchUser />}
            {showClick && <Click onClose={toggleClick} onUpload={refreshPosts} />}

            <ShowPost refreshTrigger={refreshTrigger} />
          </main>
        </>
      )}
    </div>
  );
};

export default App;
