import React, { useState } from 'react'
import Row from 'components/ui/Row'
import { Spotify } from 'context/SpotifyContext'

const Favorites = () => {

    const { view, handleView } = Spotify()

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

    return (
        <div>
            <h1>Here are your recent favorites!</h1>
            <div className="favorites-toggle">
                <button onClick={handleView} className='bg-button text-text dark:bg-dark-button dark:text-dark-text'>Songs</button>
                <button onClick={handleView} className='bg-button text-text dark:bg-dark-button dark:text-dark-text'>Artists</button>
            </div>
            <Row type={types[view]} rowLength={rowLength} />
        </div>
    )
}

export default Favorites