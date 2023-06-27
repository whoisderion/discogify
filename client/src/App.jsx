import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useSearchParams } from "react-router-dom";
import * as ROUTES from 'data/constants/routes';

import { UserAuth } from "context/AuthContext";
import Landing from "pages/Landing";
import Home from 'pages/Home';
import Signup from "pages/Signup";
import Signin from "pages/Signin";
import Account from "pages/Account";
import Favorites from "pages/Favorites";
import { Artist, Album } from 'pages/Catalog'
import ProtectedRoute from "components/ProtectedRoute";
import NavigationBar from 'components/NavigationBar';
import PublicRoute from "components/PublicRoute"
import Footer from "components/Footer";

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
              {/* give home the props of what was the last selected catagory */}
              <Route
                path={ROUTES.HOME}
                element={<ProtectedRoute><Home /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.LANDING}
                element={<Landing />} />
              <Route
                path={ROUTES.SIGN_UP}
                element={<PublicRoute><Signup /></PublicRoute>}
              />
              <Route
                path={ROUTES.SIGN_IN}
                element={<PublicRoute><Signin /></PublicRoute>}
              />
              <Route
                path={ROUTES.ACCOUNT}
                element={<ProtectedRoute><Account /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.COLLECTION}
                element={<ProtectedRoute>
                  <h1>Welcome to your collection!</h1>
                </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.WISHLIST}
                element={<ProtectedRoute><h1>Here's your wishlist!</h1></ProtectedRoute>}
              />
              {/* give favorites the props of what was the last selected catagory */}
              <Route
                path={ROUTES.RECENT_FAVORITES}
                element={<ProtectedRoute><Favorites /></ProtectedRoute>}
              />
              <Route
                path={ROUTES.RECENT_RELEASES}
                element={<ProtectedRoute><h1>Here are the most recent vinyl releases!</h1></ProtectedRoute>}
              />
              <Route
                path={ROUTES.UPCOMING_RELEASES}
                element={<ProtectedRoute><h1>Upcoming Releases</h1></ProtectedRoute>}
              />
              <Route
                path='/catalog/:artist/'
                element={<ProtectedRoute><Artist /></ProtectedRoute>}
              />
              <Route
                path='/catalog/:artist/:album'
                element={<ProtectedRoute><Album /></ProtectedRoute>}
              />
            </Routes>
          </div>
          <Footer />
        </Router>
      </SpotifyContextProvider>
    </AuthContextProvider>
  );
}

export default App;