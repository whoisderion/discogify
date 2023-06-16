import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Spotify } from "context/SpotifyContext";
import { useEffect } from "react";

import "components/ui/Carousel/Carousel.css";

const Carousel = ({ title, route, type, setType }) => {

    const [view, setView] = useState("favorite_tracks")

    const rowLength = 6
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
    }

    function showItems(type) {
        if (type.name == 'track') {
            return (
                < div className={`${type.name}-layout inline-grid grid-cols-6 mb-4`}>
                    {
                        type.store.data.slice(0, rowLength).map((item) => (
                            <div className={`${item.name} `} key={item.id}>
                                <Link to={`/catalog/${encodeURIComponent(String(item.artist).replace(/\s+/g, '-'))}/${encodeURIComponent(String(item.album).replace(/\s+/g, '-'))}`}>
                                    <div className={`${type.name}-image`}>
                                        <img src={item.image} className='aspect-square object-cover' />
                                    </div>
                                    {/* <p>{console.log(type)}</p> */}
                                    <p>{item.name}</p>
                                    {item.artist && <p>{item.artist}</p>}
                                </Link>
                            </div>
                        ))
                    }
                </div >
            )
        } else {
            return (
                < div className={`${type.name}-layout inline-grid grid-cols-6 mb-4`}>
                    {
                        type.store.data.slice(0, rowLength).map((item) => (
                            <Link to={`/catalog/${encodeURIComponent(String(item.name).replace(/\s+/g, '-'))}`}>
                                <div className={`${item.name}`} key={item.id}>
                                    <div className={`${type.name}-image`}>
                                        <img src={item.image} className='aspect-square object-cover' />
                                    </div>
                                    <p>{item.name}</p>
                                    {item.artist && <p>{item.artist}</p>}
                                </div>
                            </Link>
                        ))
                    }
                </div >
            )
        }
    }

    return (
        <div className="Carousel">
            <div>
                <h3>{title}</h3>
                <div className="favorites-toggle">
                    <button onClick={handleView}>Songs</button>
                    <button onClick={handleView}>Artists</button>
                </div>
            </div>
            {showItems(types[view])}
            <Link to={route}>
                <div className="see-more">{"see more >"}</div>
            </Link>
        </div>
    );
};

export default Carousel;