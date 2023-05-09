#STEP: typescript builder
FROM node:18-alpine3.16 AS tsbuilder

ENV LANG C.UTF-8
ENV EDITOR nano

WORKDIR /app

#cache dev npm install
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci \
&& npm install typescript -g

COPY src ./src

RUN npm run build

#STEP: build node production runner from compiled typescript project (dist/)
FROM node:18-alpine3.16 AS botrunner

ARG BOT_TOKEN
ARG DISCORD_CLIENT_ID
ARG DISCORD_GUILD_ID

ENV DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
ENV DISCORD_GUILD_ID=$DISCORD_GUILD_ID
ENV BOT_TOKEN=$BOT_TOKEN
ENV LANG C.UTF-8
ENV EDITOR nano

WORKDIR /app

#cache dev prod install
COPY package*json .
RUN npm ci --omit=dev


#STEP: botinstance
FROM botrunner AS register

#copy npm stuff
#COPY --from=botrunner /app/node_modules .
#COPY --from=botrunner /app/package*.json .
#copy compiled typescript

WORKDIR /app
COPY --from=tsbuilder /app/dist ./dist
RUN npm run register

#STEP: run bot
FROM register AS bot

ENV LANG C.UTF-8
ENV EDITOR nano
RUN apk add dumb-init
RUN mkdir /data

# APP dir
WORKDIR /app
#COPY --from=register /app/node_modules .
#COPY --from=register /app/package*.json .
#COPY --from=tsbuilder /app/dist .

# RUN
CMD ["dumb-init", "npm", "start"]