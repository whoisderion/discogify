import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from 'data/constants/routes.js';
import { Spotify } from "context/SpotifyContext";
import { useEffect } from "react";

import "components/ui/Carousel/Carousel.css";

const Carousel = ({ title, route, type, setType }) => {
    const { getData } = Spotify()

    const handleCarouselType = () => {
        type == "favorite_tracks" ? setType("favorite_artists") : setType("favorite_tracks")
    }

    useEffect(() => {
        const fetchTopSongs = async () => {
            const data = await getData('favorite_artists')
            console.log(data)
        }
        try {
            fetchTopSongs()
        } catch (e) {
            console.error(e)
        }
    }, [])

    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteSongs'))
    const favoriteArtists = JSON.parse(localStorage.getItem('favoriteArtists'))

    function showTracks() {
        return (
            <div className="track-layout">
                {favoriteTracks.slice(0, 9).map((track) => (
                    <div className={`track`} key={track.id}>
                        <div className="track-image">
                            <img src={track.image} />
                        </div>
                        <p>{track.name}</p>
                        <p>{track.artist}</p>
                    </div>
                ))}
            </div>
        )
    }

    function showArtists() {
        return (
            <div className="track-layout">
                {favoriteArtists.slice(0, 9).map((artist) => (
                    <div className={`artist`} key={artist.id}>
                        <div className="artist-image">
                            <img src={artist.image} />
                        </div>
                        <p>{artist.name}</p>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="Carousel">
            <div>
                <h3>{title}</h3>
                <div className="favorites-toggle">
                    <button onClick={handleCarouselType}>Songs</button>
                    <button onClick={handleCarouselType}>Artists</button>
                </div>
            </div>
            {type == 'favorite_tracks' ? showTracks() : showArtists()}
            <Link to={route}>
                <div className="see-more">{"see more >"}</div>
            </Link>
        </div>
    );
};

export default Carousel;