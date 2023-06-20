import { React, useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const Album = () => {
    const { album, artist } = useParams()
    const albumName = decodeURIComponent(album).replace(/\-+/g, ' ')
    const artistName = decodeURIComponent(artist).replace(/\-+/g, ' ')
    const [queryTrack, setQueryTrack] = useSearchParams('')
    const trackName = decodeURIComponent(queryTrack.get("track"))
    // console.log(trackName.replace(/\ +/g, '-'))

    const [searchResults, setSearchResults] = useState([])
    const store = JSON.parse(localStorage.getItem('favoriteSongs')).data
    const artistStore = JSON.parse(localStorage.getItem('favoriteArtists')).data

    const [albumImage, setAlbumImage] = useState('')
    const [tracklist, setTracklist] = useState([])

    const [numDisks, setNumDisk] = useState(1)

    useEffect(() => {
        getAlbumData()
    }, [])

    async function getAlbumData() {
        await axios.get(`${import.meta.env.VITE_SERVER_URL}/discogs/search?artist=${artistName}&album=${albumName}`)
            .then(response => {
                console.log('response received:', response.data)
                console.log(store, albumName)
                console.log(filterArr(store, albumName))
                if (filterArr(store, albumName)[0].image) {
                    setAlbumImage(filterArr(store, albumName)[0].image)
                    console.log('album in favorite songs')
                } else if (filterArr(artistStore, albumName)[0].image) {
                    setAlbumImage(filterArr(artistStore, albumName)[0].image)
                    console.log('album not in favorite songs list')
                } else {
                    setAlbumImage('https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png')
                    console.log('album image not found')
                }
                setSearchResults(response.data)
                if (response.data[0].resourceUrl !== null) {
                    axios.get(response.data[0].resourceUrl)
                        .then(res => {
                            console.log('tracklist set (1)')
                            setTracklist(res.data.tracklist)
                            // checkTracklist(res.data.tracklist)
                        })
                        .catch(e => {
                            console.log('tracklist error (2):', e.message)
                            setTracklist(['No Tracklist on Discogs'])
                        })
                } else {
                    console.log('cant find tracklist (3.0)')
                    if (trackName !== null && trackName !== '') {
                        searchSong()
                    }
                }
            })
            .catch((e) => {
                console.log('discogs search (4):', e.message)
                setTracklist(['No Tracklist on Discogs'])

            })
    }

    async function searchSong() {
        await axios.get(`${import.meta.env.VITE_SERVER_URL}/discogs/search?artist=${artistName}&track=${trackName}`)
            .then(response => {
                console.log('response', response)
                setAlbumImage(filterArr(store, albumName)[0].image)
                setSearchResults(response.data)
                try {
                    axios.get(response.data[0].resourceUrl)
                        .then(res => {
                            setTracklist(res.data.tracklist)
                            // checkTracklist(res.data.tracklist)
                            console.log('tracklist set (0.1)')
                        })
                        .catch(e => {
                            console.log('tracklist error (0.2):', e.message)
                            setTracklist(['No Tracklist on Discogs'])
                        })
                }
                catch {
                    console.log(trackName + ', ' + albumName + ', ' + artistName)
                    console.log('cant find tracklist (0.3)')
                    setTracklist(['No Tracklist on Discogs'])
                }
            })
            .catch(e => {
                console.log('cant find tracklist (0.4)')
                setTracklist(['No Tracklist on Discogs'])
            })
    }

    // need to fix for error 4
    const filterArr = (arr, searchKey) => {
        return arr.filter(function (obj) {
            return Object.keys(obj).some(function (key) {
                return obj[key].includes(searchKey);
            })
        });
    }

    function checkTracklist(arr) {
        const lastSide = arr.slice(-1)[0].position[0].codePointAt(0)
        const sideOne = "A".charCodeAt(0)
        const numSides = (lastSide - sideOne) + 1
        // console.log(numSides / 2)
        // split up tracks by disks
    }

    if (searchResults.length !== 0) {
        return (
            <div className='Contents'>
                <h1 className='my-6'>{albumName} by <Link to={`/catalog/${decodeURIComponent(artist)}`}>{artistName}</Link></h1>
                <div className='albumInfo flex'>
                    <div className='album-image'>
                        <img src={albumImage}></img>
                    </div>
                    <div className='tracklist pl-4'>
                        <h3>Tracklist</h3>
                        <ul>
                            {tracklist.map((item, itemIndex) => {
                                return (
                                    <p className="my-3" key={itemIndex}>{item.position} {item.title} {item.duration}</p>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className='marketListings'>
                    <h3>Vinyl on the market</h3>
                    {/* displayAlbums(searchResults) */}
                    <div className='results inline-grid grid-cols-4'>
                        {
                            searchResults.map((result) => (
                                <div className='result border-2 border-slate-200 m-4 p-4' key={result.id}>
                                    <p className='available-units'>Units Available: {result.numForSale}</p>
                                    <p className='lowest-price'>Lowest Price: ${result.lowestPrice}</p>
                                    <p className='vinyl-types'>Vinyl Type:
                                        {result.descriptions.descriptions}
                                    </p>
                                    <p className='additional-info'>Additional Info: {result.descriptions.text}</p>
                                    <p className='discogs-id'>Discogs ID: {result.id}</p>
                                    <p className='release-date'>Release Date: {result.dateReleased}</p>
                                    <p><a href={result.marketplaceLink} target="_blank">View on Discogs</a></p>
                                    {/* <p className='discogs-url'>Discogs URL: {result.marketplaceLink}</p> */}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
    else if (tracklist[0] == 'No Tracklist on Discogs') {
        return (
            <div>
                <h1>This album was not found on Discogs</h1>
                <h3>Try viewing <Link to={`/catalog/${decodeURIComponent(artist)}`}> this artist's catalog</Link> to find more vinyl releases</h3>
            </div>
        )
    }
    else {
        return (<div>Loading</div>)
    }
}

export default Album