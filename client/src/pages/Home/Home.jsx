import React from "react";
import Carousel from "components/ui/Carousel/Carousel";
import * as ROUTES from 'data/constants/routes'

const Home = () => {
    return (
        <div className="Home">
            <h1>Welcome back to Discogify!</h1>
            <Carousel
                title={"Recent Favorites"}
                route={ROUTES.RECENT_FAVORITES}
                type={"favorite_tracks"}
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