FROM node:18.18.0

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml package.json ./

RUN pnpm install

COPY . .

EXPOSE 8000

# Define the command to run the application
CMD [ "pnpm", "run", "start" ]