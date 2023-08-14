import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()

app.use(express.json())

const posts = [
  {
    username: 'Ladeia',
    title: 'post 1'
  },
  {
    username: 'Flavio',
    title: 'post 2'
  }
]

app.get('/posts', authenticateToken, (req, res, next) => {
  try {
    res.status(200).json(posts.filter(post => post.username === req.user.name))
  } catch (error) {
    next(error)
  }
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.use('*', (req, res, next) => {
  try {
    res.status(404).json({ data: 'Page not found...' })
  } catch (error) {
    next(error)
  }
})

app.use((error, req, res, next) => {
  res.status(500).json({ error: error })
})

app.listen(5555, () => console.log('Server runnint on http://localhost:5555'))