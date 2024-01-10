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
        window.location.href = response.data

        return logCallback()
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
        await loginSpotify()
        // Need to fix for DB logging

        // try {
        //     const child = await loginSpotify()
        //     const timer = setInterval(checkChild, 500)
        //     async function checkChild() {
        //         await logCallback()
        //         console.log(child)
        //         if (child) {
        //             clearInterval(timer)
        //             //await logCallback()
        //         }
        //     }
        // } catch (e) {
        //     console.log(e.message)
        // }
    }
    return (
        <div>
            <h1>Account Settings</h1>
            <h2>Discogify Settings</h2>
            <h3>User Email:{user && user.email}</h3>
            <button onClick={handleLogout} className='bg-button text-text dark:bg-dark-button dark:text-dark-text'>Logout of Discogify</button>

            <h2>Spotify</h2>
            {profile ?
                <div>
                    <h3>{profile}</h3>
                </div>
                : <button onClick={handleSpotifyLogin} className='bg-button text-text dark:bg-dark-button dark:text-dark-text'>Login to of Spotify</button>
            }
        </div>
    )
}

export default Account