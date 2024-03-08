import { Express } from 'express'

export default (app: Express) => {
	app.get('/', (_, res) => res.json({ message: 'Hello, world!' }))
}
