require('dotenv').config();
const express = require('express')
const axios = require('axios')
const querystring = require('querystring')
const { response } = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const { jsonp } = require('express/lib/response');
const Discogs = require('disconnect').Client

const SCOPE = ['playlist-read-private user-top-read user-library-read user-read-private user-read-email']
const SPOTIFY_API_URL = "https://api.spotify.com/v1"
const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'https://accounts.spotify.com'],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.set('json spaces', 4)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Discogify Index')
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

app.get('/spotify/testlogin', (req, res) => {
    res.redirect('https://accounts.spotify.com/authorize?' +
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
                // console.log('\nREFRESH TOKEN:', SPOTIFY_REFRESH_TOKEN, '\n Secret:', REFRESH_TOKEN_SECRET)
                const SPOTIFY_ACCESS_TOKEN = response.data.access_token;
                const accessToken = jwt.sign({ token: SPOTIFY_ACCESS_TOKEN, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, process.env.ACCESS_TOKEN_SECRET)
                const refreshToken = jwt.sign({ token: SPOTIFY_REFRESH_TOKEN, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), }, process.env.REFRESH_TOKEN_SECRET)
                res.cookie('accessToken', accessToken, { httpOnly: true })
                res.cookie('refreshToken', refreshToken, { httpOnly: true, });
                // console.log('\nJWT', refreshToken)
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
    res.send("<script>window.close();</script >")
})

// do i redirect to this endpoint if the /spotify_callback endpoint doesn't return a 200 or an error?
app.get('/spotify/refresh-token*', (req, res) => {
    //console.log(SPOTIFY_REFRESH_TOKEN)
    let SPOTIFY_REFRESH_TOKEN = ''

    if (req.cookies.refreshToken) {
        SPOTIFY_REFRESH_TOKEN = jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, token) => {
            if (err) {
                console.log('Refresh Verification Error:', err.message)
                return null
            }
            //console.log('Decrypted refresh token:', token.token);
            return token.token
        })
    } else {
        console.log('\nNo refreshToken cookie found... getting token from api query')
        SPOTIFY_REFRESH_TOKEN = req.query.token
        console.log(req.query.token)
    }

    const data = querystring.stringify({
        'grant_type': 'refresh_token',
        'refresh_token': SPOTIFY_REFRESH_TOKEN
    });
    //console.log('\ndata:', data, '\n')

    axios.post('https://accounts.spotify.com/api/token', data, {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            'Accept-Encoding': 'application/json',
            Authorization: `Basic ${new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        }
    })
        .then(response => {
            console.log('refreshing... '/*, response.data*/)
            if (response.status === 200) {
                const accessToken = jwt.sign({ token: response.data.access_token }, process.env.ACCESS_TOKEN_SECRET)
                res.cookie('accessToken', accessToken, { httpOnly: true })
                console.log('refreshed token!!')
            } else {
                console.log('not good')
                res.send(response.data);
            }
        })
        .catch((error) => {
            console.log('token refresh: Error ' + error.response.status + ' (' + error.response.request.res.statusMessage + ') \n')
            console.log(error.response.data)
            res.status(204).send(error.message);
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

const discogsUserAgent = "Discogify/0.1 +http://discogify.com"
const discogsClient = new Discogs(discogsUserAgent, {
    consumerKey: process.env.DISCOGS_KEY,
    consumerSecret: process.env.DISCOGS_SECRET
})
var oauth = {}
const discogsDB = discogsClient.database()
const discogsMarket = discogsClient.marketplace()

app.get('/discogs/test', (req, res) => {
    db.getRelease(176126, function (err, data) {
        res.send(data)
    })
})

app.get('/discogs/authorize', (req, res) => {
    var oAuth = discogsClient.oauth()
    oAuth.getRequestToken(
        process.env.DISCOGS_KEY,
        process.env.DISCOGS_SECRET,
        'http://127.0.0.1:4444/discogs/callback',
        (err, requestData) => {
            res.cookie('requestData', requestData)
            res.redirect(requestData.authorizeUrl);
        }
    )
})

app.get('/discogs/callback', (req, res) => {
    const requestData = req.cookies.requestData
    var oAuth = new Discogs(requestData).oauth();
    oAuth.getAccessToken(
        req.query.oauth_verifier, // Verification code sent back by Discogs
        function (err, accessData) {
            oauth = new Discogs(accessData)
            res.cookie('accessData', accessData)
            res.send('Received access token!');
        }
    );
})

app.get('/discogs/identity', function (req, res) {
    var accessData = req.cookies.accessData
    var dis = new Discogs(accessData);
    dis.getIdentity(function (err, data) {
        res.send(JSON.stringify(data));
    });
});

// test url
// http://127.0.0.1:4444/discogs/search?artist=unknown-mortal-orchestra&album=multi-love&track=puzzles
app.get('/discogs/search*', (req, res) => {
    var artistName = '';
    var albumName = '';
    var trackName = '';

    if (req.query.artist) {
        artistName = req.query.artist
    }
    if (req.query.album) {
        albumName = req.query.album
    }
    if (req.query.track) {
        trackName = req.query.track
    }

    const vinylObj = {
        artist: artistName,
        release_title: albumName,
        track: trackName,
        format: 'vinyl'
    }

    discogsDB.search(vinylObj)
        .then(async (searchList) => {
            var listingInfo = []

            const searchResults = filterAlbumResults(searchList["results"])
            for (const album of searchResults) {
                const data = getDataFromAlbumResult(album)
                const extraData = await fetchAdditionResources(data['resourceUrl'])
                listingInfo.push({ ...data, ...extraData })
            }

            if (listingInfo.length == 0) {
                console.log('album not in discogs api')
                console.log(listingInfo)
                res.status(204).send(listingInfo)
            } else {
                console.log('album found')
                console.log(listingInfo)
                res.send(listingInfo)
            }
        })
})

function getDataFromAlbumResult(album) {
    const id = album['id']
    const masterUrl = album['master_url']
    const uri = album['uri']
    let descriptions = { descriptions: 'No Data' }
    const resourceUrl = album['resource_url']
    const marketplaceLink = `https://www.discogs.com/sell/release/${id}?ev=rb`

    // marketplaceLink to be used to obtain high price for each vinyl type 


    try {
        if (album['formats'][0]) {
            descriptions = album['formats'][0]
            // console.log('start album')
            // console.log(album)
            // console.log('end album')
        }
    } catch (e) {
        console.log('Error:', e.message, "; There is (probably) no description in album['formats'][0]")
    }

    let albumData = {
        id: id,
        masterUrl: masterUrl,
        uri: uri,
        descriptions: descriptions,
        resourceUrl: resourceUrl,
        marketplaceLink: marketplaceLink
    }

    console.log(albumData)
    return albumData
}

async function fetchAdditionResources(url) {
    try {
        const response = await axios.get(url);
        let resObj = {
            dateReleased: 'No Data',
            dateAdded: 'No Data',
            lowestPrice: 'No Data',
            numForSale: 'No Data',
            additionalInfo: 'No Data',
        };
        if (await response.data['released']) {
            resObj.dateReleased = response.data['released']
        }
        if (await response.data['date_added']) {
            resObj.dateAdded = response.data['date_added']
        }
        if (await response.data['lowest_price']) {
            resObj.lowestPrice = response.data['lowest_price']
        }
        if (await response.data['num_for_sale']) {
            resObj.numForSale = response.data['num_for_sale']
        }
        if (await response.data['notes']) {
            resObj.additionalInfo = response.data['notes']
        }
        console.log(resObj)
        return resObj;
    } catch (err) {
        console.log('Fetch Additional Resources Error:', err);
        return {};
    }
}

function filterAlbumResults(results) {
    let filteredResults = []
    for (const album of results) {
        if (album['master_url'] != null) {
            filteredResults.push(album)
        }
    }
    return filteredResults
}

app.get('/test', authenticateAccessToken, (req, res) => {
    res.sendStatus(200)
})

function authenticateAccessToken(req, res, next) {
    const token = req.cookies['accessToken']
    // console.log(token)
    const currentTime = Math.floor(Date.now() / 1000)
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            console.log('access token expired')
            return res.sendStatus(403)
        }
        req.token = decodedToken
        console.log(currentTime - decodedToken.iat)
        if ((currentTime - decodedToken.iat) > 3500) {
            console.log('expired')
            try {
                console.log('authenticated token sent for refresh...')
                // console.log('\nencrypted token:', token)
                // console.log('\ndecodedToken.token:', decodedToken.token)
                axios.get(`http://127.0.0.1:4444/spotify/refresh-token?token=${decodedToken.token}`)
            } catch (e) {
                console.log(e.data)
            }
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