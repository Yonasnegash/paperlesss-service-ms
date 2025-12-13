FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL deps (including devDependencies)
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build


# ------------------------
# Runtime Image
# ------------------------

FROM node:22 AS runner

WORKDIR /app

COPY package*.json ./

# production deps only
RUN npm install --only=production

# copy built files
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/app.js"]
