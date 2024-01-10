import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as ROUTES from 'data/constants/routes'
import FormInput from 'components/form/FormInput';
import { UserAuth } from 'context/AuthContext';

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const { createUser } = UserAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await createUser(email, password)
            navigate(ROUTES.ACCOUNT)
        } catch (e) {
            setError(e.message)
            console.log(e.message)
        }
    }

    return (
        <div>
            <h1>Sign up for a free account</h1>
            <p>Already have an account?<Link to={ROUTES.SIGN_IN}>Sign In</Link></p>
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
                <button type="submit" className='bg-button text-text dark:bg-dark-button dark:text-dark-text'>Sign up</button>
            </form>
        </div>
    )
}

export default Signup