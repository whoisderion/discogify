import React from 'react'

const FormInput = ({ label, id, ...inputProps }) => {
    return (
        <div className='formInput'>
            <label>{label}</label>
            <input
                id={id}
                {...inputProps}
            />
        </div>
    )
}

export default FormInput