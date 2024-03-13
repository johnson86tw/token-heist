import path from 'path'
import fs from 'fs'
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { CLIENT_URL, logger } from './config'
import { createWebSocketServer } from './websocket/wss'

async function main() {
	logger.info('Starting server...')

	const app = express()
	const port = process.env.PORT ?? 8000

	app.use(express.json())
	app.use(
		cors({
			origin: CLIENT_URL,
		}),
	)

	const httpServer = createServer(app)
	createWebSocketServer(httpServer, CLIENT_URL)

	httpServer.listen(port, () => logger.info(`Listening on port ${port}`))

	// import all non-index files from this folder
	const routeDir = path.join(__dirname, 'routes')
	const routes = await fs.promises.readdir(routeDir)
	for (const routeFile of routes) {
		const { default: route } = await import(path.join(routeDir, routeFile))
		route(app)
	}
}

main().catch(err => {
	logger.error(`Uncaught error: ${err}`)
	process.exit(1)
})
