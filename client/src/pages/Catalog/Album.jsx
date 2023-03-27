import { React, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import * as ROUTES from 'data/constants/routes'

const Album = () => {
    const { album, artist } = useParams()
    const albumName = decodeURIComponent(album).replace(/\-+/g, ' ')
    const artistName = decodeURIComponent(artist).replace(/\-+/g, '-')

    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        getAlbumData()
    }, [])

    const getAlbumData = async () => {
        await axios.get(`${ROUTES.SERVER_URL}/discogs/search?artist=${artistName}&album=${albumName}`)
            .then(response => {
                console.log(response.data)
                setSearchResults(response.data)
            })
            .catch((e) => {
                console.log(e.message)
            })
    }

    if (searchResults.length !== 0) {
        return (
            <div className='Contents'>
                <h1>{albumName} by {artistName}</h1>
                <div className='albumInfo'>
                    <h3>Tracklist</h3>
                </div>
                <div className='marketListings'>
                    <h3>Vinyl on the market</h3>
                    {/* displayAlbums(searchResults) */}
                    <div className='results inline-grid grid-cols-4'>
                        {
                            searchResults.map((result) => (
                                <div className='result border-2 border-slate-200 m-4' key={result.id}>
                                    <p className='available-units'>Units Available: {result.numForSale}</p>
                                    <p className='lowest-price'>Lowest Price: ${result.lowestPrice}</p>
                                    <p className='vinyl-types'>Vinyl Type:
                                        {result.descriptions.descriptions}
                                    </p>
                                    <p className='additional-info'>Additional Info: {result.descriptions.text}</p>
                                    <p className='discogs-id'>Discogs ID: {result.id}</p>
                                    <p className='release-date'>Release Date: {result.dateReleased}</p>
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