import path from 'path'
import fs from 'fs'
import express from 'express'

main().catch(err => {
	console.log(`Uncaught error: ${err}`)
	process.exit(1)
})

async function main() {
	const app = express()
	const port = process.env.PORT ?? 8000
	app.listen(port, () => console.log(`Listening on port ${port}`))
	app.use('*', (req, res, next) => {
		res.set('access-control-allow-origin', '*')
		res.set('access-control-allow-headers', '*')
		next()
	})
	app.use(express.json())

	// import all non-index files from this folder
	const routeDir = path.join(__dirname, 'routes')
	const routes = await fs.promises.readdir(routeDir)
	for (const routeFile of routes) {
		const { default: route } = await import(path.join(routeDir, routeFile))
		route(app)
	}
}
