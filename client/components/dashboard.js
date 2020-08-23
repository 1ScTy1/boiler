import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div id="title">
      <p>Dashboard</p>
      <Link to="/dashboard/profile/1">Go to Profile</Link> <br />
      <Link to="/dashboard/main">Go to Main</Link>
    </div>
  )
}
export default Dashboard
