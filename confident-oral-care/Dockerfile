FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY config ./config
COPY content ./content
COPY public ./public
COPY src ./src
# The test calendar, staff-review requests and booking records persist here.
RUN mkdir -p /app/data && chown node:node /app/data
VOLUME ["/app/data"]
EXPOSE 3000
USER node
CMD ["node", "src/server.mjs"]
