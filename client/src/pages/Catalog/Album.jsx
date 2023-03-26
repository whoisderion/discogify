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
                    <div className='results'>
                        {
                            searchResults.map((result) => (
                                <div key={result.id}>
                                    <p>Units Available: {result.numForSale}</p>
                                    <p>Lowest Price: {result.lowestPrice}</p>
                                    <p>Vinyl Type:
                                        {result.descriptions.descriptions}
                                    </p>
                                    <p>Additional Info: {result.descriptions.text}</p>
                                    <p>Discogs ID: {result.id}</p>
                                    <p>Release Date: {result.dateReleased}</p>
                                    <p>Discogs URL: {result.marketplaceLink}</p>
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