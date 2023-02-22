require('dotenv').config();
const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const { response } = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const SCOPE = ['playlist-read-private user-top-read user-library-read user-read-private user-read-email']
const SPOTIFY_API_URL = "https://api.spotify.com/v1"
const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'https://accounts.spotify.com'],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('INDEX')
})

app.get('/spotify/login', (req, res) => {
    res.send('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: SCOPE,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI
        }))
})

app.get('/spotify/callback', (req, res) => {
    const code = req.query.code || null;

    const usp = new URLSearchParams({
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
    });

    // request the access token now that you've completed user authenification
    axios({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: usp,
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            'Accept-Encoding': 'application/json',
            Authorization: `Basic ${new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
    })
        .then(response => {
            if (response.status === 200) {
                const SPOTIFY_REFRESH_TOKEN = response.data.refresh_token;
                const SPOTIFY_ACCESS_TOKEN = response.data.access_token;
                const accessToken = jwt.sign({ token: SPOTIFY_ACCESS_TOKEN, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, process.env.ACCESS_TOKEN_SECRET)
                const refreshToken = jwt.sign({ token: SPOTIFY_REFRESH_TOKEN, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, process.env.REFRESH_TOKEN_SECRET)
                res.cookie('accessToken', accessToken, { httpOnly: true })
                res.cookie('refreshToken', refreshToken, { httpOnly: true, });
                res.redirect('/close')

            } else {
                res.send(response);
                res.redirect('/spotify/refresh_token')
            }
        })
        .catch((error) => {
            res.send(error);
        })
})

app.get('/close', (req, res) => {
    res.send(res.send("<script>window.close();</script > "))
})

// do i redirect to this endpoint if the /spotify_callback endpoint doesn't return a 200 or an error?
app.get('/spotify/refresh-token', (req, res) => {
    const SPOTIFY_REFRESH_TOKEN = req.cookies.refreshToken

    const usp = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN
    });

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: usp,
        headers: {
            Authorization: `Basic ${new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
            'Accept': 'application/json',
            "Content-Type": "application/x-www-form-urlencoded",
        },
        json: true
    })
        .then(response => {

            if (response.status === 200) {
                const accessToken = jwt.sign({ token: response.data.access_token }, process.env.ACCESS_TOKEN_SECRET)
                res.cookie('accessToken', accessToken, { httpOnly: true })
                console.log('refreshed token!!')
            } else {
                res.send(response);
                console.log('not good')
            }
        })
        .catch((error) => {
            res.send(error);
            console.log('error')
        })
})

app.get('/spotify/current-user', authenticateAccessToken, (req, res) => {
    SPOTIFY_ACCESS_TOKEN = req.token.token
    axios.get("https://api.spotify.com/v1/me", {
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
        },
    })
        .then(response => {
            if (response.status === 200) {
                res.send(
                    'display name: ' + response.data.display_name +
                    ' > email: ' + response.data.email +
                    ' > spotify id: ' + response.data.id +
                    ' > country: ' + response.data.country
                )
            }
        })
        .catch((error) => {
            if (error.response.status === 401) {
                res.send('Bad/Expired Token')
            } else {
                res.send(error.response.data);
            }
        })
})

app.get('/spotify/top*', authenticateAccessToken, (req, res) => {
    // test url
    // http://localhost:4444/spotify/top?type=tracks&limit=1&time_range=medium_term
    SPOTIFY_ACCESS_TOKEN = req.token.token
    axios.get(`${SPOTIFY_API_URL}/me/top/${req.query.type}`, {
        headers: {
            "content-type": "applicaiton/json",
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
        },
        params: {
            limit: req.query.limit,
            time_range: req.query.time_range
        }
    })
        .then(response => {
            if (response.status === 200) {
                res.send(response.data)
            } else {
                res.send(response);
            }
        })
        .catch((error) => {
            if (error.response.status === 401) {
                res.send('Bad/Expired Token')
            } else {
                res.send(error.response.data);
            }
        })
})

app.get('/spotify/new-releases*', authenticateAccessToken, (req, res) => {
    // test url
    // http://localhost:4444/spotify/new-releases?country=US&limit=3
    SPOTIFY_ACCESS_TOKEN = req.token.token
    axios.get(`${SPOTIFY_API_URL}/browse/new-releases`, {
        headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
            'content-type': 'applicaiton/json',
        },
        params: {
            country: req.query.country,
            limit: req.query.limit
        }
    })
        .then((response) => {
            if (response.status === 200) {
                res.send(response.data)
            }
        })
        .catch((error) => {
            if (error.response.status === 401) {
                res.send('Bad/Expired Token')
            } else {
                res.send(error.response.data)
            }
        })
})

app.get('/spotify/playlists*', authenticateAccessToken, (req, res) => {
    // test url
    // http://localhost:4444/spotify/playlists?limit=30
    const SPOTIFY_ACCESS_TOKEN = req.token.token;
    axios.get(`${SPOTIFY_API_URL}/me/playlists`, {
        headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
            'content-type': 'application/json',
        },
        params: {
            limit: req.query.limit,
            offset: req.query.offset,
        }
    })
        .then((response) => {
            if (response.status === 200) {
                res.send(response.data)
            }
        })
        .catch((error) => {
            if (error.status === 401) {
                res.send('Bad/Expired Token')
            } else {
                res.send(error.response.data)
            }
        })
})

app.get('/spotify/favorite/:type', authenticateAccessToken, (req, res) => {
    // test url
    // http://127.0.0.1:4444/spotify/favorite/tracks?limit=4
    SPOTIFY_ACCESS_TOKEN = req.token.token;
    itemType = req.params.type
    axios.get(`${SPOTIFY_API_URL}/me/top/${itemType}`, {
        headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
            'content-type': 'application/json',
        },
        params: {
            limit: req.query.limit,
            offset: req.query.offset,
            time_range: req.query.time_range
        }
    })
        .then((response) => {
            if (response.status === 200) {
                res.send(response.data)
            }
            else {
                console.log('not 200')
                res.send(response.data)
            }
        })
        .catch((error) => {
            if (error.status === 401) {
                res.send('Bad/Expired Token')
            } else {
                res.send(error.response)
            }
        })
})

app.get('/test', authenticateAccessToken, (req, res) => {
    res.sendStatus(200)
})

function authenticateAccessToken(req, res, next) {
    const token = req.cookies['accessToken']
    //console.log(req)
    const currentTime = Math.floor(Date.now() / 1000)
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
        if (err) return res.sendStatus(403)
        req.token = token
        console.log(currentTime - token.iat)
        if ((currentTime - token.iat) > 3300) {
            console.log('expired')
            //axios.get('/spotify/refresh-token')
        }
        next()
    })
}

function authenticateRefreshToken(req, res, next) {
    const token = req.cookies['refreshToken']
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, token) => {
        if (err) return res.sendStatus(403)
        req.token = token
        next()
    })
}

function handleAuthorizationResponse(res) {
    if (this.status == 401) {

    }
}

app.listen(process.env.PORT, () => {
    console.log(`The server is running on process.env.port ${process.env.PORT}`)
}) 