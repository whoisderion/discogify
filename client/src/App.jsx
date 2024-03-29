import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as ROUTES from 'data/constants/routes';

import {Landing, Home, Signup, Signin, Account, Favorites, Artist, Album , NotFound} from "pages";
import {ProtectedRoute, PublicRoute, NavigationBar, Footer} from "components";
import {AuthContextProvider} from "context/AuthContext";
import {UserAuth} from "context/AuthContext";
import SpotifyContextProvider from "context/SpotifyContext"

function App() {

  const isLoading = UserAuth()
  return isLoading ? <h1>Loading...{console.log('this page is loading')}</h1> : (
    <div className='flex flex-col bg-background text-text a:text-link dark:bg-dark-background dark:text-dark-text dark:a-dark-text' >
      <AuthContextProvider>
        <SpotifyContextProvider>
          <Router>
            <NavigationBar />
            <div className="App max-w-full flex-auto">
              <Routes>
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
                  element={<ProtectedRoute><h1>Welcome to your collection!</h1></ProtectedRoute>}
                />
                <Route
                  path={ROUTES.WISHLIST}
                  element={<ProtectedRoute><h1>Here's your wishlist!</h1></ProtectedRoute>}
                />
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
                <Route
                  path='*'
                  element={<ProtectedRoute><NotFound /></ProtectedRoute>}
                />
              </Routes>
            </div>
            <Footer className='bottom-0 w-full bg-background text-text dark:bg-dark-background dark:text-dark-text mt-auto' />
          </Router>
        </SpotifyContextProvider>
      </AuthContextProvider>
    </div>
  );
}

export default App;