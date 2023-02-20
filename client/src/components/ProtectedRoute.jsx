import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from 'context/AuthContext'
import * as ROUTES from 'data/constants/routes'

const ProtectedRoute = ({ children }) => {
    const { user } = UserAuth()
    if (user) {
        return (children)
    }

    console.log('not logged in... leaving this protected route')
    return <Navigate to={ROUTES.LANDING} />
}

export default ProtectedRoute