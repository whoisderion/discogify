import React from 'react'
import { UserAuth } from 'context/AuthContext'
import { Spotify } from 'context/SpotifyContext'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from 'data/constants/routes'
import axios from 'axios';

const Account = () => {

    const { user, logout } = UserAuth()
    const { profile, getCurrentUserProfile } = Spotify()

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate(ROUTES.SIGN_IN)
        } catch (e) {
            console.log(e.message)
        }
    }

    async function loginSpotify() {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/spotify/login`, {
            withCredentials: true,
        })

        return window.open(response.data)
    }

    async function logCallback() {
        const data = {
            discogifyEmail: user.email
        }
        const response_log = await axios.post(`${import.meta.env.VITE_SERVER_URL}/spotify/log-callback`, data, {
            withCredentials: true
        })

        return response_log
    }

    const handleSpotifyLogin = async () => {
        try {
            const child = await loginSpotify()
            const timer = setInterval(checkChild, 500)
            async function checkChild() {
                if (child.closed) {
                    clearInterval(timer)
                    await logCallback()
                }
            }
        } catch (e) {
            console.log(e.message)
        }
    }
    return (
        <div>
            <h1>Account Settings</h1>
            <h2>Discogify Settings</h2>
            <h3>User Email:{user && user.email}</h3>
            <button onClick={handleLogout}>Logout of Discogify</button>

            <h2>Spotify</h2>
            {profile ?
                <div>
                    <h3>{profile}</h3>
                </div>
                : <button onClick={handleSpotifyLogin}>Login to of Spotify</button>
            }
        </div>
    )
}

export default Account