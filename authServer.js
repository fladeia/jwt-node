import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()

app.use(express.json())

let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  
  if(refreshToken == null) return res.sendStatus(401)
  if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    
    const accessToken = generateAccessToken({ name: user.name })
    
    res.status(200).json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  console.log("🚀 ~ file: authServer.js:10 ~ refreshTokens:", refreshTokens)
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  console.log("🚀 ~ file: authServer.js:10 ~ refreshTokens:", refreshTokens)
  
  res.sendStatus(204)
})

app.post('/login', (req, res, next) => {
  try {
    const username = req.body.username
    const user = { name: username }
    const accessToken = generateAccessToken(user) //{ name: 'Flavio' }
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    
    refreshTokens.push(refreshToken)
    console.log("🚀 ~ file: authServer.js:10 ~ refreshTokens:", refreshTokens)
    
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken })
    
  } catch (error) {
    next(error)
  }
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
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

app.listen(6666, () => console.log('Server runnint on http://localhost:6666'))