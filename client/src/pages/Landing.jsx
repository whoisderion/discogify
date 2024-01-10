import React from 'react'
import { Link } from 'react-router-dom'
import * as ROUTES from 'data/constants/routes'

const Landing = () => {
    return (
        <div>
            <h1>Discogify</h1>
            <h3>Grow your collection with personalized reccomendations.</h3>
            <button>
                <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </button>
            <button>
                <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
            </button>
        </div>
    )
}

export default Landing