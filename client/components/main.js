import React from 'react'
import { Link } from 'react-router-dom'

const Main = () => {
  return (
    <div>
      <div id="title">Main</div>
      <Link to="/dashboard">Go to Root</Link> <br />
      <Link to="/dashboard/profile/1">Go to Profile</Link>
    </div>
  )
}
export default Main
