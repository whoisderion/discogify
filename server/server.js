require("dotenv").config()
const express = require("express")
const axios = require("axios")
const querystring = require("querystring")
const app = express()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const Discogs = require("disconnect").Client
const { PrismaClient } = require("@prisma/client")
const { access } = require("fs")
const prisma = new PrismaClient()

const SCOPE = [
	"playlist-read-private user-top-read user-library-read user-read-private user-read-email",
]
const SPOTIFY_API_URL = "https://api.spotify.com/v1"
const corsOptions = {
	origin: [
		"http://127.0.0.1:5173",
		"https://accounts.spotify.com",
		"https://api.discogs.com",
		"https://whale-app-ebaic.ondigitalocean.app",
		"https://discogify.com",
		"https://www.discogify.com",
		"discogify.com",
		"discogify-client.pages.dev",
	],
	methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
}

app.set("json spaces", 4)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
	res.send("Discogify Index")
})

app.post("/create-user", async (req, res) => {
	// plan create User

	console.log("create user request:", req.body)
	createdDateTime = Date.parse(req.body.created.slice(5))
	signInDateTime = Date.parse(req.body.lastSignIn.slice(5))

	let email = req.body.email
	let uid = req.body.uid
	let created = new Date(createdDateTime)
	let lastSignIn = new Date(signInDateTime)
	let lastLogInUnix = new Date(req.body.lastLogInUnix)

	const user = await prisma.User.create({
		data: {
			email: email,
			firebaseUUID: uid,
			dateCreated: created,
			lastSignedIn: lastSignIn,
		},
	})

	console.log("created new user:", user)

	res.sendStatus(200)
})

app.post("/sign-in-user", async (req, res) => {
	signInTime = new Date()
	console.log("(1.0) logging user's sign in to the DB...")

	const currUser = await prisma.user.findUnique({
		where: {
			email: req.body.email,
		},
	})

	if (currUser == null) {
		console.log("redirecting to '/create-user'")
		res.redirect(307, "/create-user")
	} else {
		const updateUser = await prisma.user.update({
			where: {
				email: currUser.email,
			},
			data: {
				lastSignedIn: signInTime,
			},
		})
		res.status(200).send(currUser)
	}
})

app.get("/spotify/login", (req, res) => {
	res.send(
		"https://accounts.spotify.com/authorize?" +
			querystring.stringify({
				response_type: "code",
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope: SCOPE,
				redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
			})
	)
})

app.get("/spotify/testlogin", (req, res) => {
	res.redirect(
		"https://accounts.spotify.com/authorize?" +
			querystring.stringify({
				response_type: "code",
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope: SCOPE,
				redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
			})
	)
})

app.get("/spotify/callback", (req, res) => {
	const code = req.query.code || null

	const usp = new URLSearchParams({
		code: code,
		redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
		grant_type: "authorization_code",
	})

	// request the access token now that you've completed user authenification
	axios({
		method: "post",
		url: "https://accounts.spotify.com/api/token",
		data: usp,
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"Accept-Encoding": "application/json",
			Authorization: `Basic ${new Buffer.from(
				`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
			).toString("base64")}`,
		},
	})
		.then(async (response) => {
			const SPOTIFY_REFRESH_TOKEN = response.data.refresh_token
			const SPOTIFY_ACCESS_TOKEN = response.data.access_token
			// console.log('(2.0) generated new Spotify tokens...')
			// access token: 60 * 60
			// refresh token: 60 * 60 * 2
			const accessToken = jwt.sign(
				{
					token: SPOTIFY_ACCESS_TOKEN,
					exp: Math.floor(Date.now() / 1000) + 60 * 60,
				},
				process.env.ACCESS_TOKEN_SECRET
			)
			const refreshToken = jwt.sign(
				{
					token: SPOTIFY_REFRESH_TOKEN,
					exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
				},
				process.env.REFRESH_TOKEN_SECRET
			)
			res.cookie("accessToken", accessToken, { httpOnly: true })
			res.cookie("refreshToken", refreshToken, { httpOnly: true })

			res.redirect(process.env.CLIENT_REDIRECT_URL)
		})
		.catch((error) => {
			res.send(error)
		})
})

app.post("/spotify/log-callback", async (req, res) => {
	// console.log('(3.0) logging callback')
	const spotifyUpdateTime = new Date()
	const useremail = req.body.discogifyEmail
	const currUser = await prisma.user.findUnique({
		where: {
			email: useremail,
		},
	})
	const SPOTIFY_ACCESS_TOKEN = req.cookies.accessToken
	// console.log('(3.1) accessToken exists: ' + (SPOTIFY_ACCESS_TOKEN != null))
	try {
		const data = {
			token: jwt.verify(SPOTIFY_ACCESS_TOKEN, process.env.ACCESS_TOKEN_SECRET),
		}
		if (
			(currUser.spotifyEmail ||
				currUser.spotifyCountry ||
				currUser.spotifyID ||
				currUser.spotifyName) == null
		) {
			const spotifyResponse = await axios.post("/spotify/current-user", data)
			const spotifyData = spotifyResponse.data
			const updateUser = await prisma.user.update({
				where: {
					email: currUser.email,
				},
				data: {
					spotifyName: spotifyData.displayName,
					spotifyEmail: spotifyData.email,
					spotifyID: spotifyData.spotifyID,
					spotifyCountry: spotifyData.country,
					lastSpotifyUpdate: spotifyUpdateTime,
				},
			})
			console.log("updated user login w/ new info")
		} else {
			const updateUser = await prisma.user.update({
				where: {
					email: currUser.email,
				},
				data: {
					lastSpotifyUpdate: spotifyUpdateTime,
				},
			})
			console.log("updated user login")
		}

		res.sendStatus(200)
	} catch (error) {
		if (req.cookies.refreshToken != null) {
			// console.log('(3.e1) token error:', error.message)
			console.log("there is a refresh token")
		} else {
			// console.log('(3.e2) token error:', error.message)
			console.log("there is NOT a refresh token")
		}
		res.sendStatus(204)
	}
})

app.get("/discogify-server/close", (req, res) => {
	res.send("<script>window.close();</script >")
})

app.get("/close", (req, res) => {
	res.send("<script>window.close();</script >")
})

app.get("/spotify/refresh-token*", (req, res) => {
	//console.log(SPOTIFY_REFRESH_TOKEN)
	let SPOTIFY_REFRESH_TOKEN = ""
	console.log("cookie exists:", req.cookies.refreshToken != null)
	if (req.cookies.refreshToken) {
		jwt.verify(
			req.cookies.refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			(err, token) => {
				if (token) {
					const data = querystring.stringify({
						grant_type: "refresh_token",
						refresh_token: token.token,
					})

					axios
						.post("https://accounts.spotify.com/api/token", data, {
							headers: {
								"content-type": "application/x-www-form-urlencoded",
								"Accept-Encoding": "application/json",
								Authorization: `Basic ${new Buffer.from(
									`${process.env.SPOTIFY_CLIENT_ID}:${
										process.env.SPOTIFY_CLIENT_SECRET
									}`
								).toString("base64")}`,
							},
						})
						.then((response) => {
							console.log("refreshing... ")
							const accessToken = jwt.sign(
								{
									token: response.data.access_token,
									exp: Math.floor(Date.now() / 1000) + 60 * 60,
								},
								process.env.ACCESS_TOKEN_SECRET
							)
							// console.log(jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET))
							res.cookie("accessToken", accessToken, { httpOnly: true })
							console.log("refreshed token!!")
							res.sendStatus(200)
						})
						.catch((error) => {
							console.log("token refresh Error:", error.response)
							res.status(204).send(error.message)
						})
				} else {
					console.log(
						"Refresh Verification Error:",
						err.message + "\n> please get a new refresh token"
					)
				}
				//console.log('Decrypted refresh token:', token.token);
			}
		)
	}
})

app.post("/spotify/current-user", (req, res) => {
	SPOTIFY_ACCESS_TOKEN = req.body.token
	axios
		.get("https://api.spotify.com/v1/me", {
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
			},
		})
		.then((response) => {
			if (response.status === 200) {
				const spotifyData = {
					displayName: response.data.display_name,
					email: response.data.email,
					spotifyID: response.data.id,
					country: response.data.country,
				}
				//console.log(spotifyData)
				res.status(200).json(spotifyData)
			}
		})
		.catch((error) => {
			console.log("'/spotify/current-user' error: " + error.message)
			if (error.response.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				res.send(error.response.data)
			}
		})
})

app.get("/spotify/top*", authenticateAccessToken, (req, res) => {
	// test url
	// http://localhost:4444/spotify/top?type=tracks&limit=1&time_range=medium_term
	SPOTIFY_ACCESS_TOKEN = req.token.token
	axios
		.get(`${SPOTIFY_API_URL}/me/top/${req.query.type}`, {
			headers: {
				"content-type": "applicaiton/json",
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
			},
			params: {
				limit: req.query.limit,
				time_range: req.query.time_range,
			},
		})
		.then((response) => {
			if (response.status === 200) {
				res.send(response.data)
			} else {
				res.send(response)
			}
		})
		.catch((error) => {
			if (error.response.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				res.send(error.response.data)
			}
		})
})

app.get("/spotify/new-releases*", authenticateAccessToken, (req, res) => {
	// test url
	// http://localhost:4444/spotify/new-releases?country=US&limit=3
	SPOTIFY_ACCESS_TOKEN = req.token.token
	axios
		.get(`${SPOTIFY_API_URL}/browse/new-releases`, {
			headers: {
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
				"content-type": "applicaiton/json",
			},
			params: {
				country: req.query.country,
				limit: req.query.limit,
			},
		})
		.then((response) => {
			if (response.status === 200) {
				res.send(response.data)
			}
		})
		.catch((error) => {
			if (error.response.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				res.send(error.response.data)
			}
		})
})

app.get("/spotify/playlists*", authenticateAccessToken, (req, res) => {
	// test url
	// http://localhost:4444/spotify/playlists?limit=30
	const SPOTIFY_ACCESS_TOKEN = req.token.token
	axios
		.get(`${SPOTIFY_API_URL}/me/playlists`, {
			headers: {
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
				"content-type": "application/json",
			},
			params: {
				limit: req.query.limit,
				offset: req.query.offset,
			},
		})
		.then((response) => {
			if (response.status === 200) {
				res.send(response.data)
				//plan User.playlists[]
			}
		})
		.catch((error) => {
			if (error.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				res.send(error.response.data)
			}
		})
})

app.get("/spotify/favorite/:type", authenticateAccessToken, (req, res) => {
	// test url
	// http://127.0.0.1:4444/spotify/favorite/tracks?limit=4

	// plan: update lastSpotifyUpdate/user.songs[]/user.artists[](-> user.albums[])

	SPOTIFY_ACCESS_TOKEN = req.token.token
	itemType = req.params.type
	axios
		.get(`${SPOTIFY_API_URL}/me/top/${itemType}`, {
			headers: {
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
				"content-type": "application/json",
			},
			params: {
				limit: req.query.limit,
				offset: req.query.offset,
				time_range: req.query.time_range,
			},
		})
		.then((response) => {
			console.log("getting favorites success", itemType)
			if (response.status === 200) {
				res.send(response.data)
				//plan User.songs[]/User.artist[] lastSpotifyUpdate
			} else {
				console.log("not 200")
				res.send(response.data)
				//plan User.songs[]/User.artist[] lastSpotifyUpdate
			}
		})
		.catch((error) => {
			console.log("getting favorites error", itemType)
			if (error.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				console.log(error)
				res.status(400).send(["Error"])
			}
		})
})

app.get("/spotify/getreleases/:id", authenticateAccessToken, (req, res) => {
	const SPOTIFY_ACCESS_TOKEN = req.token.token
	const artistID = req.params.id
	axios
		.get(`${SPOTIFY_API_URL}/artists/${artistID}/albums`, {
			headers: {
				Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
				"content-type": "application/json",
			},
			params: {
				include_groups: "album,single",
				limit: 50,
			},
		})
		.then((response) => {
			if (response.status === 200) {
				res.send(response.data)
			}
		})
		.catch((error) => {
			if (error.status === 401) {
				res.send("Bad/Expired Token")
			} else {
				res.send(error)
			}
		})
})

const discogsUserAgent = "Discogify/0.1 +http://discogify.com"
const discogsClient = new Discogs(discogsUserAgent, {
	consumerKey: process.env.DISCOGS_KEY,
	consumerSecret: process.env.DISCOGS_SECRET,
})
var oauth = {}
const discogsDB = discogsClient.database()
const discogsMarket = discogsClient.marketplace()

app.get("/discogs/test", (req, res) => {
	db.getRelease(176126, function(err, data) {
		res.send(data)
	})
})

app.get("/discogs/authorize", (req, res) => {
	var oAuth = discogsClient.oauth()
	oAuth.getRequestToken(
		process.env.DISCOGS_KEY,
		process.env.DISCOGS_SECRET,
		"http://127.0.0.1:4444/discogs/callback",
		(err, requestData) => {
			res.cookie("requestData", requestData)
			res.redirect(requestData.authorizeUrl)
		}
	)
})

app.get("/discogs/callback", (req, res) => {
	const requestData = req.cookies.requestData
	var oAuth = new Discogs(requestData).oauth()
	oAuth.getAccessToken(
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData) {
			oauth = new Discogs(accessData)
			res.cookie("accessData", accessData)
			res.send("Received access token!")
		}
	)
})

app.get("/discogs/identity", function(req, res) {
	var accessData = req.cookies.accessData
	var dis = new Discogs(accessData)
	dis.getIdentity(function(err, data) {
		res.send(JSON.stringify(data))
	})
})

// test url
// http://127.0.0.1:4444/discogs/search?artist=unknown-mortal-orchestra&album=multi-love&track=puzzles
// plan: update lastDiscogsUpdate/Vinyl
app.get("/discogs/search*", (req, res) => {
	var artistName = ""
	var albumName = ""
	var trackName = ""
	let vinylObj = {}

	if (req.query.artist) {
		artistName = req.query.artist
	}
	if (req.query.album) {
		albumName = req.query.album
	}
	if (req.query.track) {
		trackName = req.query.track
	}

	if (artistName !== "" && albumName !== "") {
		vinylObj = {
			artist: artistName,
			release_title: albumName,
			format: "vinyl",
		}
	} else {
		vinylObj = {
			artist: artistName,
			release_title: albumName,
			track: trackName,
			format: "vinyl",
		}
	}

	// console.log(vinylObj)

	discogsDB
		.search(vinylObj)
		.then(async (searchList) => {
			var listingInfo = []

			const searchResults = filterAlbumResults(searchList["results"])
			for (const album of searchResults) {
				const data = getDataFromAlbumResult(album)

				/* 
                break requests up to return the data first, then incrementally 
                batch the requests for extraData in groups of 5, change frontend 
                to show loading for each square until the extraData is loaded
                */

				listingInfo.push(data)
			}

			//plan?? loop through spotify favorite songs/artists in batches of 1 every 1.2 seconds? then lastDiscogsUpdate

			if (listingInfo.length == 0) {
				console.log("vinyl not in discogs api")
				//console.log(listingInfo)
				res.status(204).send(listingInfo)
			} else {
				console.log("album found")
				// console.log(listingInfo)
				res.send(listingInfo)
			}
		})
		.catch((err) => {
			console.log("search error", err)
			res.status(204).send([])
		})
})

app.get("/discogs/getAdditonal*", async (req, res) => {
	// const userID = req.cookies
	// console.log(req)
	const releaseId = req.query.id
	const urlPrefix = "https://api.discogs.com/releases/"

	const data = await fetchAdditionResources(urlPrefix + String(releaseId))

	res.send(data)
})

function convertDateTime(datetime) {
	let dateTime = Date.parse(datetime.slice(5))

	return dateTime
}

function getDataFromAlbumResult(album) {
	const id = album["id"]
	const masterUrl = album["master_url"]
	const uri = album["uri"]
	let descriptions = { descriptions: "No Data" }
	const resourceUrl = album["resource_url"]
	const marketplaceLink = `https://www.discogs.com/sell/release/${id}?ev=rb`

	// marketplaceLink to be used to obtain high price for each vinyl type
	try {
		if (album["formats"][0]) {
			descriptions = album["formats"][0]
			// console.log('start album')
			// console.log(album)
			// console.log('end album')
		}
	} catch (e) {
		console.log(
			"Error:",
			e.message,
			"; There is (probably) no description in album['formats'][0]"
		)
	}

	let albumData = {
		id: id,
		masterUrl: masterUrl,
		uri: uri,
		descriptions: descriptions,
		resourceUrl: resourceUrl,
		marketplaceLink: marketplaceLink,
	}

	//console.log(albumData)
	return albumData
}

// const extraData = await fetchAdditionResources(data['resourceUrl'])
async function fetchAdditionResources(url) {
	try {
		const response = await axios.get(url)
		let resObj = {
			dateReleased: "No Data",
			dateAdded: "No Data",
			lowestPrice: "No Data",
			numForSale: "No Data",
			additionalInfo: "No Data",
		}
		if (await response.data["released"]) {
			resObj.dateReleased = response.data["released"]
		}
		if (await response.data["date_added"]) {
			resObj.dateAdded = response.data["date_added"]
		}
		if (await response.data["lowest_price"]) {
			resObj.lowestPrice = response.data["lowest_price"]
		}
		if (await response.data["num_for_sale"]) {
			resObj.numForSale = response.data["num_for_sale"]
		}
		if (await response.data["notes"]) {
			resObj.additionalInfo = response.data["notes"]
		}
		const rateLimit = response.headers["x-discogs-ratelimit"]
		const rateLimitRemaining = response.headers["x-discogs-ratelimit-remaining"]
		const rateLimitUsed = response.headers["x-discogs-ratelimit-used"]
		const releaseID = response.data.id
		console.log(
			"ratelimit: " +
				rateLimit +
				";\nratelimit remaining: " +
				rateLimitRemaining +
				";\nratelimit used: " +
				rateLimitUsed +
				";\n--------" +
				releaseID +
				"--------\n"
		)
		return resObj
	} catch (err) {
		console.log("Fetch Additional Resources Error:", err.response.data.message)
		const rateLimit = err.response.headers["x-discogs-ratelimit"]
		const rateLimitRemaining =
			err.response.headers["x-discogs-ratelimit-remaining"]
		const rateLimitUsed = err.response.headers["x-discogs-ratelimit-used"]
		const releaseID = err.response.data.id
		console.log(
			"ratelimit: " +
				rateLimit +
				";\nratelimit remaining: " +
				rateLimitRemaining +
				";\nratelimit used: " +
				rateLimitUsed +
				";\n--------" +
				releaseID +
				"--------\n"
		)
		return {}
	}
}

function filterAlbumResults(results) {
	let filteredResults = []
	for (const album of results) {
		if (album["master_url"] != null) {
			filteredResults.push(album)
		}
	}
	return filteredResults
}

app.get("/test", (req, res) => {
	res.sendStatus(200)
})

app.get("/verify-token", (req, res) => {
	let access,
		refresh = false
	try {
		access = jwt.verify(
			req.cookies.accessToken,
			process.env.ACCESS_TOKEN_SECRET
		)
		refresh = jwt.verify(
			req.cookies.refreshToken,
			process.env.REFRESH_TOKEN_SECRET
		)
		// console.log('these tokens are okay!')
		res.send({ accessToken: true, refreshToken: true })
	} catch (e) {
		console.log("THESE TOKENS ARE NO GOOD ABORT! ABORT!!! AB-\n" + e.message)
		try {
			refresh = jwt.verify(
				req.cookies.refreshToken,
				process.env.REFRESH_TOKEN_SECRET
			)
			res.send({ accessToken: false, refreshToken: true })
		} catch (error) {
			res.send({ accessToken: false, refreshToken: false })
		}
	}
})

function authenticateAccessToken(req, res, next) {
	const token = req.cookies["accessToken"]
	const refreshToken = req.cookies["refreshToken"]
	//console.log(refreshToken)
	const currentTime = Math.floor(Date.now() / 1000)
	if (token == null) return res.sendStatus(401)
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
		if (err) {
			console.log("access token expired")
			return res.sendStatus(403)
		}
		req.token = decodedToken
		console.log(currentTime - decodedToken.iat)
		if (currentTime - decodedToken.iat > 3500) {
			console.log("expired")
			try {
				console.log("authenticated token sent for refresh...")
				// console.log('\nencrypted token:', token)
				// console.log('\ndecodedToken.token:', decodedToken.token)
				axios.get(`/spotify/refresh-token?token=${decodedToken.token}`)
			} catch (e) {
				console.log(e.data)
			}
		}
		next()
	})
}

function authenticateRefreshToken(req, res, next) {
	const token = req.cookies["refreshToken"]
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
	console.log(`The server is running on port ${process.env.PORT}`)
})

// app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../build/index.html')); })
