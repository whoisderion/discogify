import React from 'react'
import { Link } from "react-router-dom";

const Row = ({ type, index, rowLength }) => {
    if (type.name == 'track') {
        return (
            < div className={`${type.name}-layout`}>
                {
                    type.store.slice(index, (index + rowLength)).map((item) => (
                        <Link to={`/catalog/${encodeURIComponent(String(item.artist).replace(/\s+/g, '-'))}/${encodeURIComponent(String(item.album).replace(/\s+/g, '-'))}`}>
                            <div className={`${item.name}`} key={item.id}>
                                <div className={`${type.name}-image`}>
                                    <img src={item.image} />
                                </div>
                                <p>{item.name}</p>
                                {item.artist && <p>{item.artist}</p>}
                            </div>
                        </Link>
                    ))
                }
            </div >
        )
    } else {
        return (
            < div className={`${type.name}-layout`}>
                {
                    type.store.slice(index, (index + rowLength)).map((item) => (
                        <Link to={`/catalog/${encodeURIComponent(String(item.name).replace(/\s+/g, '-'))}`}>
                            <div className={`${item.name}`} key={item.id}>
                                <div className={`${type.name}-image`}>
                                    <img src={item.image} />
                                </div>
                                <p>{item.name}</p>
                                {item.artist && <p>{item.artist}</p>}
                            </div>
                        </Link>
                    ))
                }
            </div >
        )
    }

}

export default Row