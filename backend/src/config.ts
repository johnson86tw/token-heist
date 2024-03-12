import winston from 'winston'
import dotenv from 'dotenv'

// Configure to read .env files
dotenv.config()

export const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(info => {
			return `${info.timestamp} ${info.level}: ${info.message}`
		}),
	),
	transports: [
		new winston.transports.Console(),
		// new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		// new winston.transports.File({ filename: 'logs/combined.log' }),
	],
})

export const CLIENT_URL = process.env.CLIENT_URL
if (!CLIENT_URL) {
	throw new Error('CLIENT_URL is not set in .env file')
}

export const PRIVATE_KEY = process.env.PRIVATE_KEY as string
if (!PRIVATE_KEY) {
	throw new Error('PRIVATE_KEY is not set in .env file')
}

export const SNEAK_VERIFIER_SEPOLIA = process.env.SNEAK_VERIFIER_SEPOLIA as string
if (!SNEAK_VERIFIER_SEPOLIA) {
	throw new Error('SNEAK_VERIFIER_SEPOLIA is not set in .env file')
}
