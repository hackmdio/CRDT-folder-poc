// import path from 'path'
const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: ['./js/index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
