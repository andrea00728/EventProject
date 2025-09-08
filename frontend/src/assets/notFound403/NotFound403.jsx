import React from 'react'
import img from '../assets/notFound403/illustration-file-deletion-error-with-confused-person_1191225-34368.avif'

function NotFound403() {
  return (
    <div className='flex items-center justify-center'>
      <div className="py-4 max-w-[400px]">
        <img src={img} alt="Not found Image" />
      </div>
    </div>
  )
}

export default NotFound403