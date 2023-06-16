import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from 'context/AuthContext'
import * as ROUTES from 'data/constants/routes'

const ProtectedRoute = ({ children }) => {
    const { user } = UserAuth()
    if (!user) {
        return (children)
    }

    // console.log('Already logged in... rerouting to the account page')
    return <Navigate to={ROUTES.ACCOUNT} />
}

export default ProtectedRoute