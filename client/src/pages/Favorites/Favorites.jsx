import React, { useState } from 'react'
import Row from 'components/ui/Row'

const Favorites = () => {

    const [view, setView] = useState("favorite_tracks")

    const rowLength = 6
    const numRows = Math.ceil(50 / rowLength)
    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteSongs'))
    const favoriteArtists = JSON.parse(localStorage.getItem('favoriteArtists'))

    const types = {
        'favorite_artists': {
            name: 'artist',
            store: favoriteArtists
        },
        'favorite_tracks': {
            name: 'track',
            store: favoriteTracks
        }
    }

    const handleView = () => {
        view == "favorite_tracks" ? setView("favorite_artists") : setView("favorite_tracks")
    }

    return (
        <div>
            <h1>Here are your recent favorites!</h1>
            <div className="favorites-toggle">
                <button onClick={handleView}>Songs</button>
                <button onClick={handleView}>Artists</button>
            </div>
            <Row type={types[view]} rowLength={rowLength} />
        </div>
    )
}

export default Favorites