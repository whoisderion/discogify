import React from 'react'

const Row = ({ type, index, rowLength }) => {
    return (
        < div className={`${type.name}-layout`}>
            {
                type.store.slice(index, (index + rowLength)).map((item) => (
                    <div className={`${item.name}`} key={item.id}>
                        <div className={`${type.name}-image`}>
                            <img src={item.image} />
                        </div>
                        <p>{item.name}</p>
                        {item.artist && <p>{item.artist}</p>}
                    </div>
                ))
            }
        </div >
    )
}

export default Row