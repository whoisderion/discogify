import React from "react";
import { useState } from "react";
import Carousel from "components/ui/Carousel/Carousel";
import * as ROUTES from 'data/constants/routes'

const Home = () => {
    const [favoritesToggle, setFavoritesToggle] = useState("favorite_tracks")
    return (
        <div className="Home">
            <h1 className="text-text dark:text-dark-text">Welcome back to Discogify!</h1>
            <Carousel
                title={"Recent Favorites"}
                route={ROUTES.RECENT_FAVORITES}
                type={favoritesToggle}
                setType={setFavoritesToggle}
            />
            {/* <Carousel
                title="Upcoming Releases"
                route={ROUTES.UPCOMING_RELEASES}
                type={"new_releases"}
            />
            <Carousel
                title="Recent Releases"
                route={ROUTES.RECENT_RELEASES}
                type={"upcoming_releases"}
            /> */}
        </div>
    )
};

export default Home;