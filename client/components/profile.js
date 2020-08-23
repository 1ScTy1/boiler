import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
  const [userList, setUserList] = useState({})
  const { user } = useParams()
  useEffect(() => {
    axios(`https://jsonplaceholder.typicode.com/users/${user}`).then(({ data }) =>
      setUserList(data)
    )
  }, [])
  return (
    <div>
      <div id="title">Profile</div>
      <div id="username">{userList.name}</div>
      <Link to="/dashboard">Go to Root</Link> <br />
      <Link to="/dashboard/main">Go to Main</Link>
    </div>
  )
}
export default Profile
