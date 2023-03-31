import { React, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import * as ROUTES from 'data/constants/routes'

const Album = () => {
    const { album, artist } = useParams()
    const albumName = decodeURIComponent(album).replace(/\-+/g, ' ')
    const artistName = decodeURIComponent(artist).replace(/\-+/g, '-')

    const [searchResults, setSearchResults] = useState([])
    const store = JSON.parse(localStorage.getItem('favoriteSongs'))

    const [albumImage, setAlbumImage] = useState('')
    const [tracklist, setTracklist] = useState([])

    const [numDisks, setNumDisk] = useState(1)

    useEffect(() => {
        getAlbumData()
    }, [])

    const getAlbumData = async () => {
        await axios.get(`${ROUTES.SERVER_URL}/discogs/search?artist=${artistName}&album=${albumName}`)
            .then(response => {
                setAlbumImage(filterArr(store, albumName)[0].image)
                setSearchResults(response.data)
                try {
                    axios.get(response.data[0].resourceUrl)
                        .then(res => {
                            setTracklist(res.data.tracklist)
                            checkTracklist(res.data.tracklist)
                        })
                        .catch(e => console.log('tracklist:', e.message))
                } catch (error) {
                    setTracklist(['No Tracklist on Discogs'])
                }
            })
            .catch((e) => {
                console.log('discogs search:', e.message)
            })
    }

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
        console.log(numSides / 2)
        // split up tracks by disks
    }

    if (searchResults.length !== 0) {
        return (
            <div className='Contents'>
                <h1 className='my-6'>{albumName} by {artistName}</h1>
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
    else {
        return (<div>Loading</div>)
    }
}

export default Album