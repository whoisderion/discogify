import React from 'react'
import { Link, useParams } from "react-router-dom";

const Row = ({ type, rowLength, store, maxRows }) => {
    if (type.name == 'track') {
        const createComponents = () => {
            let itemsArr = []
            type.store.data.forEach((item) => {
                itemsArr.push(
                    <Link key={item.id} id={item.id} to={`/catalog/${encodeURIComponent(String(item.artist).replace(/\s+/g, '-'))}/${encodeURIComponent(String(item.album).replace(/\s+/g, '-'))}?track=${item.name}`}>
                        <div className={`${item.name}`}>
                            <div className={`${type.name}-image aspect-square`}>
                                <img src={item.image} className='aspect-square object-cover min-w-full' />
                            </div>
                            <p>{item.name}</p>
                            {item.artist && <p>{item.artist}</p>}
                        </div>
                    </Link>
                )
            })
            if (maxRows) {
                return itemsArr.slice(0, (rowLength * maxRows))
            }
            return itemsArr
        }
        return (
            < div className={`${type.name}-layout inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-4 gap-4 xl:gap-7`}>
                {createComponents()}
            </div >
        )
    } else if (type.name == 'artist') {
        const createComponents = () => {
            let itemsArr = []
            type.store.data.forEach((item) => {
                itemsArr.push(
                    <Link key={item.id} id={item.id} to={`/catalog/${encodeURIComponent(String(item.name).replace(/\s+/g, '-'))}`}>
                        <div className={`${item.name}`}>
                            <div className={`${type.name}-image aspect-square`}>
                                <img src={item.image} className='aspect-square object-cover min-w-full' />
                            </div>
                            <p>{item.name}</p>
                        </div>
                    </Link>
                )
            })
            if (maxRows) {
                return itemsArr.slice(0, (rowLength * maxRows))
            }
            return itemsArr
        }
        return (
            < div className={`${type.name}-layout inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-4 gap-4 xl:gap-7`}>
                {
                    createComponents()
                }
            </div >
        )
    } else if (type.name == 'album') {
        const { artist } = useParams()
        const createComponents = () => {
            let itemsArr = []
            store.forEach((item) => {
                itemsArr.push(
                    <div key={item.albumID} className='aspect-square'>
                        <Link to={`/catalog/${artist}/${encodeURIComponent(String(item.albumName).replace(/\s+/g, '-'))}`}>
                            <img src={item.imageMD.url} className='aspect-square object-cover min-w-full'></img>
                            <p>
                                {item.albumName}
                            </p>
                        </Link>
                        <p>
                            {item.releaseDate}
                        </p>
                    </div>
                )
            })
            return itemsArr
        }
        return (
            <div className={`${type.name}-layout inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-4 gap-4 xl:gap-7`}>
                {
                    createComponents()
                }
            </div>
        )
    } else if (type.name == 'single') {
        const createComponents = () => {
            let itemsArr = []
            store.forEach((item) => {
                itemsArr.push(
                    <div key={item.albumID} className='aspect-square'>
                        <img src={item.imageMD.url} className='aspect-square object-cover min-w-full'></img>
                        <p>
                            {item.albumName}
                        </p>
                        <p>
                            {item.releaseDate}
                        </p>
                    </div>
                )
            })
            return itemsArr
        }

        return (
            <div className={`${type.name}-layout inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-4 gap-4 xl:gap-7`}>
                {
                    createComponents()
                }
            </div>
        )
    } else {
        console.log('not a valid row type')
    }

}

export default Row