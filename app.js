import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/config', (_, res) => {
  res.json({
    serverUrl: process.env.HOST || 'ws://localhost:4444'
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
