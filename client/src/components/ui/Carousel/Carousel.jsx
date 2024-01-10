import { React } from "react";
import { Link } from "react-router-dom";
import { Spotify } from "context/SpotifyContext";
import Row from "../Row";

const Carousel = ({ title, route, type, setType }) => {

    const { view, handleView } = Spotify()

    const rowLength = 6
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


    return (
        <div className="Carousel">
            <div>
                <h3>{title}</h3>
                <div className="favorites-toggle">
                    <button onClick={handleView} className="bg-menu dark:bg-dark-menu">Songs</button>
                    <button onClick={handleView} className="bg-menu dark:bg-dark-menu">Artists</button>
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