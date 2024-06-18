FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
