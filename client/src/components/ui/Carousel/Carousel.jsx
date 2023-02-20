import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from 'data/constants/routes.js';
import axios from "axios";
import { Spotify } from "context/SpotifyContext";
import { useEffect } from "react";


import "components/ui/Carousel/Carousel.css";

const Carousel = ({ title, route, type }) => {
    const { getData, favoriteTracks, setFavoriteTracks } = Spotify()

    useEffect(() => {
        const fetchTopSongs = async () => {
            const data = await getData(type)
            setFavoriteTracks(data)
        }
        try {
            fetchTopSongs()
        } catch (e) {
            console.error(e)
        }
    }, [])


    if (type == "favorite_tracks") {
        return (
            <div className="Carousel">
                <div>
                    <h3>{title}</h3>
                    <div className="favorites-toggle">
                        <button>Songs</button>
                        <button>Artists</button>
                    </div>
                </div>
                <div className="track-layout">
                    {favoriteTracks &&
                        favoriteTracks.map((track) => (
                            <div className={`track`} key={track.id}>
                                <div className="track-image">
                                    <img src={track.image} />
                                </div>
                                <p>{track.name}</p>
                                <p>{track.artist}</p>
                            </div>
                        ))
                    }
                </div>
                <Link to={route}>
                    <div className="see-more">{"see more >"}</div>
                </Link>
            </div>
        );
    }
};

export default Carousel;