import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as ROUTES from 'data/constants/routes';

import { UserAuth } from "context/AuthContext";
import Landing from "pages/Landing";
import Home from 'pages/Home';
import Signup from "pages/Signup";
import Signin from "pages/Signin";
import Account from "pages/Account";
import ProtectedRoute from "components/ProtectedRoute";
import NavigationBar from 'components/NavigationBar';

import 'App.css';
import { AuthContextProvider } from "context/AuthContext";
import { SpotifyContextProvider } from "context/SpotifyContext";

function App() {

  const isLoading = UserAuth()
  return isLoading ? <h1>Loading...{console.log('this page is loading')}</h1> : (
    <AuthContextProvider>
      <SpotifyContextProvider>
        <Router>
          <NavigationBar />
          <div className="App">
            <Routes>
              <Route
                path={ROUTES.HOME}
                element={
                  <div className="App">
                    <Home />
                  </div>}
              />
              <Route
                path={ROUTES.LANDING}
                element={<Landing />} />
              <Route
                path={ROUTES.SIGN_UP}
                element={<Signup />}
              />
              <Route
                path={ROUTES.SIGN_IN}
                element={<Signin />}
              />
              <Route
                path={ROUTES.ACCOUNT}
                element={<ProtectedRoute><Account /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.COLLECTION}
                element={
                  <h1>Welcome to your collection!</h1>
                }
              />
              <Route
                path={ROUTES.WISHLIST}
                element={<h1>Here's your wishlist!</h1>}
              />
              <Route
                path={ROUTES.RECENT_FAVORITES}
                element={<h1>Here are your recent favorites!</h1>}
              />
              <Route
                path={ROUTES.RECENT_RELEASES}
                element={<h1>Here are the most recent vinyl releases!</h1>}
              />
              <Route
                path={ROUTES.UPCOMING_RELEASES}
                element={<h1>Upcoming Releases</h1>}
              />
            </Routes>
          </div>
        </Router>
      </SpotifyContextProvider>
    </AuthContextProvider>
  );
}

export default App;