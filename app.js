import express from 'express'

const app = express()
const port = process.env.STATIC_PORT || 3000
const webrtcPort = process.env.PORT || 4444
const wsProto = process.env.PROTO || 'ws'
const host = process.env.HOST || 'localhost'

app.get('/config', (_, res) => {
  res.json({
    serverUrl: `${wsProto}://${host}:${webrtcPort}`
  })
})
app.use('/dist', express.static('dist'))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.redirect('/index.html')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
