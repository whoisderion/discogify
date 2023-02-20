import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as ROUTES from 'data/constants/routes'
import FormInput from 'components/form/FormInput'
import { UserAuth } from 'context/AuthContext'

const Signin = () => {
    const { signIn } = UserAuth()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await signIn(email, password)
            navigate(ROUTES.ACCOUNT)
        } catch (e) {
            setError(e.message)
            console.log(e.message)
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