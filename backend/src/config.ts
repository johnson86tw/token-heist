import dotenv from 'dotenv'
import winston from 'winston'

// Application start datetime
export const SERVER_START_TIME: Date = new Date()
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

// Configure dotenv package to read .env files
dotenv.config()

// Create logger instance
export const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(info => {
			return `${info.timestamp} ${info.level}: ${info.message}`
		}),
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'logs/combined.log' }),
	],
})
