import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Spotify } from "context/SpotifyContext";
import { useEffect } from "react";
import Row from "../Row";

import "components/ui/Carousel/Carousel.css";

const Carousel = ({ title, route, type, setType }) => {

    const [view, setView] = useState("favorite_tracks")

    const rowLength = 6
    console.log(type)
    const types = {
        'favorite_artists': {
            name: 'artist',
            store: JSON.parse(localStorage.getItem('favoriteArtists'))
        },
        'favorite_tracks': {
            name: 'track',
            store: JSON.parse(localStorage.getItem('favoriteSongs'))
        }
    }

    const handleView = () => {
        view == "favorite_tracks" ? setView("favorite_artists") : setView("favorite_tracks")
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
            <Row type={types[view]} rowLength={rowLength} store={types[view].store.data} maxRows={1}></Row>
            <Link to={route}>
                <div className="see-more">{"see more >"}</div>
            </Link>
        </div>
    );
};

export default Carousel;