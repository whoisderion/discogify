import { React, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import * as ROUTES from 'data/constants/routes'
import Row from 'components/ui/Row'

const Artist = () => {
    const { artist } = useParams()
    const artistName = decodeURIComponent(artist).replace(/\-+/g, ' ')
    const store = JSON.parse(localStorage.getItem('favoriteArtists')).data
    const [artistImage, setArtistImage] = useState('')
    const [artistID, setArtistID] = useState('')
    const [albums, setAlbums] = useState([])
    const [followers, setFollowers] = useState(0)
    const [genres, setGenres] = useState([])
    const rowLength = 5

    let albumsArr = []
    let singlesArr = []

    useEffect(() => {
        getArtistData()
    }, [])

    function filterArr(arr, searchKey) {
        return arr.filter(obj => Object.values(obj).includes(searchKey));
    }

    function getArtistData() {
        const artistArr = filterArr(store, artistName)[0]
        console.log(artistArr)
        setArtistImage(artistArr.image)
        setArtistID(artistArr.id)
        setFollowers(artistArr.followers)
        setGenres(artistArr.genres)
        setAlbums(artistArr.albums)
        return artistArr
    }

    if (albums != []) {
        albums.forEach(item => {
            if (item.albumType == 'single') {
                singlesArr.push(item)
            } else {
                albumsArr.push(item)
            }
        });
    }

    function displayRows(arr, typeName) {
        const numAlbums = arr.length
        const numRows = Math.ceil(numAlbums / rowLength)
        const rowComponents = []
        for (let i = 0; i < numRows; i++) {
            const key = typeName + String(i)
            rowComponents.push(<Row type={{ name: typeName }} index={i * rowLength} rowLength={rowLength} store={arr} key={key} />
            )
        }
        return rowComponents
    }

    if (albums != []) {
        return (
            <div>
                <div>
                    <h1>{artistName}</h1>
                    <img src={artistImage}></img>
                    <ul>
                        {
                            genres.map(genre => {
                                return <li key={genre}>{genre}</li>
                            })
                        }
                    </ul>
                </div>
                <div>
                    <h3>Albums</h3>
                    {displayRows(albumsArr, 'album')}
                </div>
                <div>
                    <h3>Singles</h3>
                    {displayRows(singlesArr, 'single')}
                </div>
            </div>
        )
    } else {
        return (
            <div>Loading {artistName}'s Data...</div>
        )
    }
}

export default Artist