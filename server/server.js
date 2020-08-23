import express from 'express'

import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require('fs').promises

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]
const wFile = (users) => {
  return writeFile(`${__dirname}/user.json`, JSON.stringify(users), { encoding: 'utf8' })
}
const rFile = () => {
  return readFile(`${__dirname}/users.json`, { encoding: 'utf8' })
    .then((data) => JSON.parse(data))
    .catch(async () => {
      const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
      wFile(users)
      return users
    })
}

middleware.forEach((it) => server.use(it))

// server.get('/api/v1/users', async (req, res) => {
//   const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
//   res.json(data)
// })
//
// server.get('/api/v1/users/:id', async (req,res) =>{
//   const { id } = req.params
//   const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
//   const user = data.filter(el  =>  el.id === +id)
//   res.json(user)
// })

server.get('/api/v1/users', async (req, res) => {
  const users = await rFile()
  res.json(users)
})

server.post('/api/v1/users', async (req, res) => {
  const newUser = req.body
  const user = await rFile()
  const id = user[user.length - 1].id + 1
  const addedUsers = [...user, { ...newUser, id }]
  await wFile(addedUsers)
  res.json({ status: 'success', id })
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const newData = req.body
  const users = await rFile()
  const updateUser = users.map((el) => (el.id === +userId ? { ...el, ...newData } : el))
  await wFile(updateUser)
  res.json({ status: 'user updated', userId })
})

server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const users = await rFile()
  const deleteUser = users.filter((el) => el.id !== +userId)
  await wFile(deleteUser)
  res.json({ status: 'user deleted', id: userId })
})

server.delete('/api/v1/users', (req, res) => {
  unlink(`${__dirname}/user.json`)
  res.json({ status: 'deleted' })
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'yourproject - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
