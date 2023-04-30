import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import * as ROUTES from 'data/constants/routes'

const SpotifyContext = createContext()

export const SpotifyContextProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
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
                console.log('token fail:', tokenExists)
            })
    }

    function getData(dataType) {
        console.log('getting data context')
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

    function checkDataExists() {
        if (localStorage.getItem('favoriteSongs') != null && localStorage.getItem('favoriteArtists') != null) {
            return true
        } else {
            console.log('Error: No data in storage!')
            return false
        }
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
        if (checkDataExists() == false) {
            getData('favorite_tracks')
            getData('favorite_artists')
        }
        setIsReady(true);
    }, [])

    return (
        <SpotifyContext.Provider value={{ tokenExists, getData, getCurrentUserProfile, profile, favoriteTracks, setFavoriteTracks }}>
            {isReady ? children : null}
        </SpotifyContext.Provider>
    )
}

export const Spotify = () => {
    return useContext(SpotifyContext)
}