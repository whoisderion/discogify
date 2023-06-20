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

    const handleSpotifyLogin = async () => {
        const data = {
            discogifyEmail: user.email
        }

        try {
            await axios.get(`${ROUTES.SERVER_URL}/spotify/login`, {
                withCredentials: true,
            })
                .then(response => {
                    axios.post(`${ROUTES.SERVER_URL}/spotify/log-callback`, data, {
                        withCredentials: true
                    })
                    window.open(response.data)
                })

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