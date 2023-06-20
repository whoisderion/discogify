import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as ROUTES from 'data/constants/routes'
import FormInput from 'components/form/FormInput'
import { UserAuth } from 'context/AuthContext'
import axios from 'axios';

const Signin = () => {
    const { signIn } = UserAuth()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        try {
            signIn(email, password)
                .then(function (result) {
                    const currentUser = result.user
                    const data = {
                        email: currentUser.email,
                        uid: currentUser.uid,
                        created: currentUser.metadata.creationTime,
                        lastSignIn: currentUser.metadata.lastSignInTime,
                        lastLogInUnix: currentUser.metadata.lastLoginAt
                    }

                    axios.post(`${import.meta.env.VITE_SERVER_URL}/sign-in-user`, data, {
                        withCredentials: true,
                        credentials: 'include',
                    })
                        .then(res => {
                            console.log('sign in logged to db')
                        })
                        .catch(err => {
                            console.log('Error signing in user', err)
                        })
                })
                .catch(function (err) {
                    console.log(err)
                })
        } catch (e) {
            setError(e.message)
            //console.log(e.message)
        }
    }

    return (
        <div>
            <h1>Sign in to your account</h1>
            <p>Don't have an account yet? <Link to={ROUTES.SIGN_UP}>Sign Up</Link></p>
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Email"
                    id="emailAddress"
                    name="email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <FormInput
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign In</button>
            </form>
        </div>
    )
}

export default Signin