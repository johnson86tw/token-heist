import path from 'path'
import fs from 'fs'
import express from 'express'
import { createServer } from 'http'
import { createSocketManager } from './socketManager'
import cors from 'cors'

async function main() {
	const app = express()
	const port = process.env.PORT ?? 8000

	app.use(express.json())

	const httpServer = createServer(app)
	createSocketManager(httpServer)

	app.use(cors())

	httpServer.listen(port, () => console.log(`Listening on port ${port}`))

	// import all non-index files from this folder
	const routeDir = path.join(__dirname, 'routes')
	const routes = await fs.promises.readdir(routeDir)
	for (const routeFile of routes) {
		const { default: route } = await import(path.join(routeDir, routeFile))
		route(app)
	}
}

main().catch(err => {
	console.log(`Uncaught error: ${err}`)
	process.exit(1)
})
