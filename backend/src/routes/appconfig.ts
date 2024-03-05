import { Express } from 'express'

export default (app: Express) => {
	app.get('/api/config', (_, res) => res.json({}))
}
