import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import routes from './routes/index.js'

const app = express()

app.use(cors({ origin: config.cors.origin, credentials: true }))
app.use(express.json({ limit: '10mb', type: 'application/json' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API routes
app.use('/api', routes)

// Admin page
app.get('/admin', (_req, res) => {
  res.sendFile('admin.html', { root: '../public' })
})

// Serve frontend static files in production
if (config.nodeEnv === 'production') {
  app.use(express.static('../dist'))
}

export default app
