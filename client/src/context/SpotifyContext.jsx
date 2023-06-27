import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserAuth } from './AuthContext'
import spinner from '../assets/spinner.svg'

const SpotifyContext = createContext()

export const SpotifyContextProvider = ({ children }) => {
    let viewStart = "favorite_tracks"
    const { user } = UserAuth()
    const [isReady, setIsReady] = useState(false);
    const [tokenExists, setTokenExists] = useState(false)
    const [profile, setProfile] = useState(null)
    const [favoriteTracks, setFavoriteTracks] = useState([])
    const [view, setView] = useState(viewStart)
    const [tokenRefreshed, setTokenRefreshed] = useState(false)
    const [tracksAreReady, setTracksAreReady] = useState(false)
    const [artistAreReady, setArtistAreReady] = useState(false)

    //"favorite_tracks"
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
        console.log('getting data')
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
                    setTracksAreReady(true)
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
                        setArtistAreReady(true)
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

    function Spinner() {
        let statement = 'Just a sec...'
        if (!tracksAreReady) {
            console.log('tracks are not ready')
            statement = 'Getting your favorite songs from Spotify'
        } else if (!artistAreReady) {
            console.log('artists are not ready')
            statement = 'Getting your favorite artists from Spotify'
        }
        return (
            <div className='my-[7%]'>
                <img
                    src={spinner}
                    alt="Getting data from Spotify..."
                    className='w-[30%] mx-auto'
                />
                <p className='text-3xl text-center'>{statement}</p>
            </div>
        )
    }

    useEffect(() => {
        if (JSON.parse(window.sessionStorage.getItem('view')) !== null) {
            viewStart = JSON.parse(window.sessionStorage.getItem('view'))
            setView(viewStart)
        } else {
            viewStart = "favorite_tracks"
        }
        if (user) {
            async function verifyToken() {
                const status = await axios.get(import.meta.env.VITE_SERVER_URL + '/verify-token', {
                    withCredentials: true,
                })
                return status
            }

            let tokenIsValid = false
            let refreshTokenIsValid = false

            const checkTokenStatus = verifyToken().then(async res => {
                tokenIsValid = res.data.accessToken
                refreshTokenIsValid = res.data.refreshToken
                // console.log('token status: ', tokenIsValid, '|', refreshTokenIsValid)

                if (tokenIsValid) {
                    findToken()
                    if (checkTrackDataExists() == false) {
                        setTracksAreReady(false)
                        getData('favorite_tracks')
                    } else {
                        setTracksAreReady(true)
                    }
                    if (checkArtistDataExists() == false) {
                        setTracksAreReady(false)
                        getData('favorite_artists')
                    } else {
                        setArtistAreReady(true)
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
                    if (artistAreReady && tracksAreReady) {
                        setIsReady(true);
                    }
                } else if (refreshTokenIsValid) {
                    // console.log('need to refresh token')
                    axios.get(import.meta.env.VITE_SERVER_URL + '/spotify/refresh-token', {
                        withCredentials: true,
                    })
                        .then(() => {
                            setTokenRefreshed(true);
                            setIsReady(true);
                        })
                        .catch((error) => {
                            console.log('token refresh Error:', error.response);
                            setIsReady(true);
                        });
                } else {
                    // reroute to the account page and prmpt the user to log into spotify again
                    console.log('need to prompt user')
                    // location.replace()
                    const target = (new URL(window.location.href).origin) + '/account'
                    // console.log(window.location.href)
                    // console.log(target)
                    if (window.location.href != target) {
                        window.location.assign("/account")
                        alert("Please log into Spotify")
                    }
                    setIsReady(true)
                }
            })

        } else {
            setIsReady(true);
        }

    }, [user, tokenRefreshed, tracksAreReady, artistAreReady])

    function handleView() {
        if (view == "favorite_tracks") {
            window.sessionStorage.setItem('view', JSON.stringify("favorite_artists"))
            const storage = JSON.parse(window.sessionStorage.getItem('view'))
            setView(storage)
            console.log(view)
        } else {
            window.sessionStorage.setItem('view', JSON.stringify("favorite_tracks"))
            const storage = JSON.parse(window.sessionStorage.getItem('view'))
            setView(storage)
            console.log(view)
        }
    }

    return (
        <SpotifyContext.Provider value={{ tokenExists, getData, getCurrentUserProfile, profile, favoriteTracks, setFavoriteTracks, view, handleView }}>
            {isReady ? children : Spinner()}
        </SpotifyContext.Provider>
    )
}

export const Spotify = () => {
    return useContext(SpotifyContext)
}