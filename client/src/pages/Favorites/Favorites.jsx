import React, { useState } from 'react'
import Row from 'components/ui/Row'

const Favorites = () => {

    const [view, setView] = useState("favorite_tracks")

    const rowLength = 6
    const numRows = Math.ceil(50 / rowLength)
    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteSongs'))
    const favoriteArtists = JSON.parse(localStorage.getItem('favoriteArtists'))
    //console.log(favoriteTracks.length / rowLength)
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
        //console.log(view)
    }

    function showRows() {
        var rows = []
        for (let index = 0; index < numRows; index++) {
            rows.push(<Row type={types[view]} index={index} />)
        }
        return rows
    }

    const arr = showRows()
    console.log(arr)

    return (
        <div>
            <h1>Here are your recent favorites!</h1>
            <div className="favorites-toggle">
                <button onClick={handleView}>Songs</button>
                <button onClick={handleView}>Artists</button>
            </div>
            {/* {view == 'favorite_tracks' ? showTracks() : showArtists()} */}
            {/* {showItems(types[view], 0)} */}
            {/* {showItems(types[view], 6)} */}
            {/* {showRows()} */}
            <Row type={types[view]} index={0} rowLength={rowLength} />
            <Row type={types[view]} index={5} rowLength={rowLength} />
            <Row type={types[view]} index={11} rowLength={rowLength} />
            <Row type={types[view]} index={17} rowLength={rowLength} />
            <Row type={types[view]} index={23} rowLength={rowLength} />
            <Row type={types[view]} index={29} rowLength={rowLength} />
            <Row type={types[view]} index={35} rowLength={rowLength} />
            <Row type={types[view]} index={41} rowLength={rowLength} />
            <Row type={types[view]} index={47} rowLength={rowLength} />
        </div>
    )
}

export default Favorites