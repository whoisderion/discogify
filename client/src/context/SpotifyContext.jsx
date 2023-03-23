import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import * as ROUTES from 'data/constants/routes'

const SpotifyContext = createContext()

export const SpotifyContextProvider = ({ children }) => {
    const [tokenExists, setTokenExists] = useState(false)
    const [profile, setProfile] = useState(null)
    const [favoriteTracks, setFavoriteTracks] = useState([])

    // http://127.0.0.1:4444/spotify/favorite/tracks?limit=4
    const slug = {
        favorite_tracks: '/spotify/favorite/tracks?limit=50',
        favorite_artists: '/spotify/favorite/artists?limit=50'
    }

    function findToken() {
        axios.get(`${ROUTES.SERVER_URL}/test`, {
            withCredentials: true,
            credentials: 'include',
        })
            .then(response => {
                setTokenExists(true)
            })
            .catch(error => {
                setTokenExists(false)
                console.log('token:', tokenExists)
            })
    }

    function getData(dataType) {
        axios.get(ROUTES.SERVER_URL + slug[dataType], {
            withCredentials: true,
            credentials: 'include',
        })
            .then(response => {
                var response_arr = []
                if (dataType == 'favorite_tracks') {
                    response.data.items.forEach(item => {
                        const favorite_obj = {
                            name: item.name,
                            artist: item.artists[0].name,
                            image: item.album.images[1].url,
                            id: item.id,
                            album: item.album.name,
                        }
                        response_arr = [...response_arr, favorite_obj]
                    })
                    console.log(response_arr)
                    setFavoriteTracks(response_arr)
                    localStorage.setItem('favoriteSongs', JSON.stringify(response_arr))
                    return favoriteTracks
                }
                if (dataType == 'favorite_artists') {
                    response.data.items.forEach(item => {
                        const favorite_obj = {
                            name: item.name,
                            image: item.images[1].url,
                            id: item.id
                        }
                        response_arr = [...response_arr, favorite_obj]
                    })
                    console.log(response_arr)
                    // setFavoriteTracks(response_arr)
                    localStorage.setItem('favoriteArtists', JSON.stringify(response_arr))
                    // return favoriteTracks
                }
            })
    }

    function getCurrentUserProfile() {
        try {
            axios.get(`${ROUTES.SERVER_URL}/spotify/current-user`, {
                withCredentials: true,
            })
                .then(response => {
                    setProfile(response)
                })
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        findToken()
    }, [])

    return (
        <SpotifyContext.Provider value={{ tokenExists, getData, getCurrentUserProfile, profile, favoriteTracks, setFavoriteTracks }}>
            {children}
        </SpotifyContext.Provider>
    )
}

export const Spotify = () => {
    return useContext(SpotifyContext)
}