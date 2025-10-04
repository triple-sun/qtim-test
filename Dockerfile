# Base image
FROM node:slim AS build

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY tsconfig.build.json ./
COPY tsconfig.json ./

# Install app dependencies
RUN npm i

# Bundle app source
COPY . .

RUN npm run build

FROM node:20-slim

RUN apt-get update && apt-get install -y openssl 

# Add non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=build /usr/src/app/package*.json ./
COPY --chown=appuser:appgroup --from=build /usr/src/app/dist ./dist
COPY --chown=appuser:appgroup --from=build /usr/src/app/.env ./.env

# Switch to non-root user
USER appuser

# Expose the port on which the app will run
EXPOSE ${PORT}

# Start the server using the production build
CMD [ "npm", "run", "start:prod" ]