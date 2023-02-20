import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from 'data/constants/routes'
import { UserAuth } from "context/AuthContext";

import "components/NavigationBar/NavigationBar.css";

const NavigationBar = () => {
    const { user } = UserAuth()
    return (
        <header className="NavigationBar">
            <nav>
                <ul>
                    {user ?
                        <>
                            <Link to={ROUTES.HOME}><h1>Discogify</h1></Link>
                            <Link to={ROUTES.ACCOUNT}><li>Account</li></Link>
                            <Link to={ROUTES.COLLECTION}><li>My Collection</li></Link>
                            <Link to={ROUTES.WISHLIST}><li>My Wishlist</li></Link>
                        </> :
                        <>
                            <Link to={ROUTES.LANDING}><h1>Discogify</h1></Link>
                            <Link to={ROUTES.SIGN_IN}><li>Sign In</li></Link>
                            <Link to={ROUTES.SIGN_UP}><li>Sign Up</li></Link>
                        </>}
                </ul>
            </nav>
        </header>
    );
};

export default NavigationBar;