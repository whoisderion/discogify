import React from 'react'
import { Link } from "react-router-dom";

const Row = ({ type, index, rowLength, store }) => {
    if (type.name == 'track') {
        return (
            < div className={`${type.name}-layout inline-grid grid-cols-6 mb-4`}>
                {
                    type.store.data.slice(index, (index + rowLength)).map((item, itemIndex) => (
                        <Link key={item.id} id={item.id} to={`/catalog/${encodeURIComponent(String(item.artist).replace(/\s+/g, '-'))}/${encodeURIComponent(String(item.album).replace(/\s+/g, '-'))}?track=${item.name}`}>
                            <div className={`${item.name}`}>
                                <div className={`${type.name}-image`}>
                                    <img src={item.image} className='aspect-square object-cover' />
                                </div>
                                {/* <p>{index + itemIndex}</p> */}
                                <p>{item.name}</p>
                                {item.artist && <p>{item.artist}</p>}
                            </div>
                        </Link>
                    ))
                }
            </div >
        )
    } else if (type.name == 'artist') {
        return (
            < div className={`${type.name}-layout inline-grid grid-cols-6 mb-4`}>
                {
                    type.store.data.slice(index, (index + rowLength)).map((item) => (
                        <Link key={item.id} id={item.id} to={`/catalog/${encodeURIComponent(String(item.name).replace(/\s+/g, '-'))}`}>
                            <div className={`${item.name}`}>
                                <div className={`${type.name}-image`}>
                                    <img src={item.image} className='aspect-square object-cover' />
                                </div>
                                <p>{item.name}</p>
                                {item.artist && <p>{item.artist}</p>}
                            </div>
                        </Link>
                    ))
                }
            </div >
        )
    } else if (type.name == 'album') {
        return (
            <div className={`${type.name}-layout inline-grid grid-cols-${rowLength} mb-4`}>
                {
                    store.slice(index, (index + rowLength)).map((item) => {
                        // console.log(item.albumName)
                        return (
                            <div key={item.albumID}>
                                <img src={item.imageMD.url}></img>
                                <p>
                                    {item.albumName}
                                </p>
                                <p>
                                    {item.releaseDate}
                                </p>
                            </div>
                        )
                    })
                }
            </div>
        )
    } else if (type.name == 'single') {
        return (
            <div className={`${type.name}-layout inline-grid grid-cols-${rowLength} mb-4`}>
                {
                    store.slice(index, (index + rowLength)).map((item) => {
                        // console.log(item.albumName)
                        return (
                            <div key={item.albumID}>

                                <img src={item.imageMD.url}></img>
                                <p>
                                    {item.albumName}
                                </p>
                                <p>
                                    {item.releaseDate}
                                </p>
                            </div>
                        )
                    })
                }
            </div>
        )
    } else {
        console.log('not a valid row type')
    }

}

export default Row