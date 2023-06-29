import React from 'react'

function pageNotFound() {
    setTimeout(() => {
        window.location.href = '/home'
    }, 3000)
}

function NotFound() {
    return (
        <div>
            <h1>Oh no!</h1>
            <h3>We couldn't find the page that you requested. Redirecting you back to the homepage...</h3>
            {pageNotFound()}
        </div>
    )
}

export default NotFound