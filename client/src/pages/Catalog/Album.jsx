import { React, useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const Album = () => {
    const { album, artist } = useParams()
    const albumName = decodeURIComponent(album).replace(/\-+/g, ' ')
    const artistName = decodeURIComponent(artist).replace(/\-+/g, ' ')
    const [queryTrack, setQueryTrack] = useSearchParams('')
    const trackName = decodeURIComponent(queryTrack.get("track"))

    const [searchResults, setSearchResults] = useState([])
    const [additionalData, setAdditionalData] = useState([])
    const store = JSON.parse(localStorage.getItem('favoriteSongs')).data
    const artistStore = JSON.parse(localStorage.getItem('favoriteArtists')).data

    const [albumImage, setAlbumImage] = useState('')
    const [tracklist, setTracklist] = useState([])

    const [numDisks, setNumDisk] = useState(1)

    useEffect(() => {
        getAlbumData()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (additionalData.length < searchResults.length) {
                getAdditionalData()
            } else {
                console.log('additionalData', additionalData)
                clearInterval(interval)
            }
        }, 2500)

        return () => {
            clearInterval(interval)
        }

    }, [additionalData, searchResults])

    async function getAlbumData() {
        await axios.get(`${import.meta.env.VITE_SERVER_URL}/discogs/search?artist=${artistName}&album=${albumName}`)
            .then(response => {
                console.log('response received:', response.data)
                try {
                    setAlbumImage(filterArr(store, albumName)[0].image)
                    console.log('album in favorite songs')
                } catch {
                    console.log('album not in favorite songs list')
                    setAlbumImage(filterArtistStore())
                }
                // else {
                //     setAlbumImage('https://community.mp3tag.de/uploads/default/original/2X/a/acf3edeb055e7b77114f9e393d1edeeda37e50c9.png')
                //     console.log('album image not found')
                // }
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

    async function getAdditionalData() {
        const currentID = searchResults[additionalData.length].id
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/discogs/getAdditonal?id=${currentID}`);
        const newAdditionalData = response.data
        setAdditionalData([...additionalData, newAdditionalData]);
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
                    console.log('cant find tracklist (0.3)')
                    setTracklist(['No Tracklist on Discogs'])
                }
            })
            .catch(e => {
                console.log('cant find tracklist (0.4)')
                setTracklist(['No Tracklist on Discogs'])
            })
    }

    const filterArr = (arr, searchKey) => {
        return arr.filter(function (obj) {
            return Object.keys(obj).some(function (key) {
                return obj[key].includes(searchKey);
            })
        });
    }
    function findAlbumByName(albums, name) {
        return albums.find(album => album.albumName === name);
    }

    const filterArtistStore = () => {
        const artistReleases = filterArr(artistStore, artistName)[0].albums
        const url = findAlbumByName(artistReleases, albumName).imageMD.url
        return url
    }

    function checkTracklist(arr) {
        const lastSide = arr.slice(-1)[0].position[0].codePointAt(0)
        const sideOne = "A".charCodeAt(0)
        const numSides = (lastSide - sideOne) + 1
        console.log(lastSide, sideOne)
        // console.log(numSides / 2)
        // split up tracks by disks
    }

    function showAddtionalData(arr, dataType) {
        if (typeof additionalData[arr.length] !== 'undefined') {
            return (
                <p
                    className={
                        additionalData[arr.length][dataType] !== 'No Data' ?
                            'inline-flex' :
                            'inline-flex text-neutral-500'}>
                    {
                        additionalData[arr.length][dataType] !== 'No Data' ?
                            ' ' + additionalData[arr.length][dataType] :
                            'No Data'
                    }
                </p>
            )
        }
        else {
            return (
                <p className={'inline-flex text-neutral-500'}> {'Loading...'}</p>
            )
        }
    }

    function displayDiscogsResults() {
        const resultsArr = []
        searchResults.map((result) => (
            //text-neutral-500
            //{result.numForSale !== 'No Data' ? 'inline-flex' : 'inline-flex text-neutral-500'}

            resultsArr.push(
                <div className='result border-2 border-slate-200 m-4 p-4' key={result.id}>
                    <div className='available-units'>
                        <p className='inline-flex mr-1'>Units Available:</p>
                        {showAddtionalData(resultsArr, 'numForSale')}
                    </div>
                    <div className='lowest-price'>
                        <p className='inline-flex'>Lowest Price: $</p>
                        {showAddtionalData(resultsArr, 'lowestPrice')}
                    </div>
                    <div className='vinyl-types'>
                        <p className='inline-flex mr-1'>Vinyl Type: </p>
                        <p className={result.descriptions.descriptions !== 'No Data' && result.descriptions.descriptions !== undefined ? 'inline-flex' : 'inline-flex text-neutral-500'}>{result.descriptions.descriptions}</p>
                    </div>
                    <div className='additional-info1'>
                        <p className='inline-flex mr-1'>Additional Info 1: </p>
                        <p className={result.descriptions.text !== 'No Data' && result.descriptions.text !== undefined ? 'inline-flex' : 'inline-flex text-neutral-500'}>{result.descriptions.text}</p>
                    </div>
                    <div className='additional-info2'>
                        <p className='inline-flex mr-1'>Additional Info 2: </p>
                        {showAddtionalData(resultsArr, 'additionalInfo')}
                    </div>
                    <div className='discogs-id'>
                        <p className='inline-flex mr-1'>Discogs ID: </p>
                        <p className={result.id !== 'No Data' && result.id !== undefined ? 'inline-flex' : 'inline-flex text-neutral-500'}>{result.id}</p>
                    </div>
                    <div className='release-date'>
                        <p className='inline-flex mr-1'>Release Date: </p>
                        {showAddtionalData(resultsArr, 'dateReleased')}
                    </div>
                    <p className='discogs-url'><a href={result.marketplaceLink} target="_blank">View on Discogs</a></p>
                </div>)
        ))
        return resultsArr

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
                    <div className='results inline-grid grid-cols-4'>
                        {
                            displayDiscogsResults()
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