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
    const [albums, setAlbums] = useState([])
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

    if (albums != []) {
        return (
            <div>
                <div className='Artist-Info'>
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
                <div className='Albums'>
                    <h3>Albums</h3>
                    <Row type={{ name: 'album' }} index={0} rowLength={rowLength} store={albumsArr} />
                </div>
                <div className='Singles'>
                    <h3>Singles</h3>
                    <Row type={{ name: 'single' }} index={0} rowLength={rowLength} store={singlesArr} />
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