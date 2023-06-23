import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserAuth } from './AuthContext'

const SpotifyContext = createContext()

export const SpotifyContextProvider = ({ children }) => {
    const { user } = UserAuth()
    const [isReady, setIsReady] = useState(false);
    const [tokenExists, setTokenExists] = useState(false)
    const [profile, setProfile] = useState(null)
    const [favoriteTracks, setFavoriteTracks] = useState([])
    const [view, setView] = useState("favorite_tracks")

    // http://127.0.0.1:4444/spotify/favorite/tracks?limit=4
    const slug = {
        favorite_tracks: '/spotify/favorite/tracks?limit=50',
        favorite_artists: '/spotify/favorite/artists?limit=50'
    }

    async function findToken() {
        await axios.get(`${import.meta.env.VITE_SERVER_URL}/test`, {
            withCredentials: true,
            credentials: 'include',
        })
            .then(response => {
                setTokenExists(true)
            })
            .catch(error => {
                try {
                    // console.log(error)
                    console.log('refreshing acccess token...')
                    axios.get(import.meta.env.VITE_SERVER_URL + '/spotify/refresh-token', {
                        withCredentials: true,
                    })
                        .then(result => {
                            console.log('token test success!')
                        })
                        .catch(err => {
                            console.log('token test failed!')
                        })
                } catch (error) {
                    setTokenExists(false)
                    console.log('token fail:', tokenExists + ', status:', error.status)
                }
            })
    }

    function getData(dataType) {
        console.log('getting context data')
        axios.get(import.meta.env.VITE_SERVER_URL + slug[dataType], {
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
                    const timeCreated = Date.now()
                    localStorage.setItem('favoriteSongs', JSON.stringify({ data: response_arr, createdAt: timeCreated }))
                    return favoriteTracks
                }
                if (dataType == 'favorite_artists') {
                    console.log('retreiving favorite artist data...')
                    const startTime = Date.now()

                    async function getArtistAlbums(artistId) {
                        const response = await axios.get(import.meta.env.VITE_SERVER_URL + `/spotify/getreleases/${artistId}`, {
                            withCredentials: true,
                            credentials: 'include',
                        })
                        let albums = []
                        response.data.items.forEach(album => {
                            const albumData = {
                                imageLG: album.images[0],
                                imageMD: album.images[1],
                                imageSM: album.images[2],
                                albumName: album.name,
                                albumID: album.id,
                                albumType: album.album_type,
                                releaseDate: album.release_date
                            }
                            albums.push(albumData)
                        });

                        return albums
                    }

                    async function fetchArtistData(artist) {
                        const albumData = await getArtistAlbums(artist.id);
                        const artistWithAlbums = {
                            name: artist.name,
                            id: artist.id,
                            image: artist.images[1].url,
                            // followers: artist.followers,
                            genres: artist.genres,
                            albums: albumData
                        };
                        return artistWithAlbums;
                    }

                    async function fetchFavoriteArtistsData(favoriteArtists) {

                        for (const artist of favoriteArtists) {
                            const artistData = await fetchArtistData(artist);
                            response_arr.push(artistData);
                        }
                        console.log(response_arr)
                        return response_arr;
                    }


                    fetchFavoriteArtistsData(response.data.items)
                        .then(res => {
                            console.log('favorite artist data received!')
                            console.log(response_arr)
                            // setFavoriteTracks(response_arr)
                            const timeCreated = Date.now()
                            localStorage.setItem('favoriteArtists', JSON.stringify({ data: response_arr, createdAt: timeCreated }))
                            // return favoriteTracks
                            const endTime = Date.now()
                            const timeElapsed = endTime - startTime
                            console.log(timeElapsed + ' ms')
                        })
                }
            })
    }

    function checkTrackDataExists() {
        if (localStorage.getItem('favoriteSongs') != null) {
            return true
        } else {
            console.log('Error: No Song data in storage!')
            return false
        }
    }

    function checkArtistDataExists() {
        if (localStorage.getItem('favoriteArtists') != null) {
            return true
        } else {
            console.log('Error: No Artist data in storage!')
            return false
        }
    }

    function getCurrentUserProfile() {
        try {
            axios.get(`${import.meta.env.VITE_SERVER_URL}/spotify/current-user`, {
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
        if (user) {
            try {
                findToken()
                if (checkTrackDataExists() == false) {
                    getData('favorite_tracks')
                }
                if (checkArtistDataExists() == false) {
                    getData('favorite_artists')
                }
                const oneDayUnix = 8640000
                const currentTime = new Date()
                if (localStorage.getItem('favoriteSongs')) {
                    const favSongCreated = JSON.parse(localStorage.getItem('favoriteSongs')).createdAt
                    if ((currentTime > favSongCreated + oneDayUnix)) {
                        getData('favorite_tracks')
                    }
                }
                if (localStorage.getItem('favoriteArtists')) {
                    const favArtistCreated = JSON.parse(localStorage.getItem('favoriteArtists')).createdAt
                    if ((currentTime > favArtistCreated + oneDayUnix)) {
                        getData('favorite_artists')
                    }
                }
                setIsReady(true);
            } catch (error) {
                console.log('spotify token is expired')
                setIsReady(true)
            }
        } else {
            setIsReady(true);
        }

    }, [user])

    function handleView() {
        view == "favorite_tracks" ? setView("favorite_artists") : setView("favorite_tracks")
    }

    return (
        <SpotifyContext.Provider value={{ tokenExists, getData, getCurrentUserProfile, profile, favoriteTracks, setFavoriteTracks, view, handleView }}>
            {isReady ? children : null}
        </SpotifyContext.Provider>
    )
}

export const Spotify = () => {
    return useContext(SpotifyContext)
}