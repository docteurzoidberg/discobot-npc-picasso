#STEP 1: typescript builder
FROM node:18-alpine3.16 AS tsbuilder

ENV LANG C.UTF-8
ENV EDITOR nano

WORKDIR /app

#cache dev npm install
COPY package.json package-lock.json tsconfig.json ./
RUN npm install \
&& npm install typescript -g

COPY src ./src

RUN npm run build

#STEP 2: build node production runner from compiled typescript project (dist/)
FROM node:18-alpine3.16 AS prodrunner

ENV LANG C.UTF-8
ENV EDITOR nano

WORKDIR /app

#cache dev prod install
COPY package*json .
RUN npm install --omit=dev
COPY --from=tsbuilder /app/dist ./dist

#STEP 3: 
FROM prodrunner AS botrunner

ARG BOT_TOKEN
ARG DISCORD_CLIENT_ID
ARG DISCORD_GUILD_ID

ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
ENV DISCORD_GUILD_ID=$DISCORD_GUILD_ID
ENV BOT_TOKEN=$BOT_TOKEN

WORKDIR /app

COPY --from=prodrunner /app/node_modules ./node_modules
COPY --from=prodrunner /app/package*.json ./
COPY --from=prodrunner /app/dist ./dist

#STEP 4: register bot
FROM botrunner AS register

COPY --from=botrunner /app/node_modules .
COPY --from=botrunner /app/package*.json .
COPY --from=botrunner /app/dist .

RUN npm run register

#STEP 5: run bot
FROM botrunner AS bot

ENV LANG C.UTF-8
ENV EDITOR nano
RUN apk add dumb-init
RUN mkdir /data

# APP dir
WORKDIR /app
COPY --from=botrunner /app/node_modules .
COPY --from=botrunner /app/package*.json .
COPY --from=botrunner /app/dist .

# RUN
CMD ["dumb-init", "npm", "start"]