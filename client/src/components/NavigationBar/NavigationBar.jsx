import React from "react";
import { Link } from "react-router-dom";
import * as ROUTES from 'data/constants/routes'
import { UserAuth } from "context/AuthContext";
import useDarkMode from "hooks/useDarkMode";

const ThemeIcon = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    return (
        <span onClick={handleMode}>
            {darkTheme ? (
                <h3>Light</h3>
            ) : (
                <h3>Dark</h3>
            )}
        </span>
    );
};

const NavigationBar = () => {
    const { user } = UserAuth()
    return (
        <header className="flex-initial w-100% opacity-75 sticky px-[2.5vw] text-text bg-menu dark:text-dark-text dark:bg-dark-menu">
            <nav>
                <ul>
                    {user ?
                        <>
                            <Link to={ROUTES.HOME}><h1>Discogify</h1></Link>
                            <Link to={ROUTES.RECENT_FAVORITES}><li>Favorites</li></Link>
                            <Link to={ROUTES.ACCOUNT}><li>Account</li></Link>
                            <ThemeIcon />
                            {/* <Link to={ROUTES.COLLECTION}><li>My Collection</li></Link>
                            <Link to={ROUTES.WISHLIST}><li>My Wishlist</li></Link> */}
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