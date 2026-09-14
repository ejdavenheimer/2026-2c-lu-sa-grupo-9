FROM node:26-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/

RUN npm install --workspace=backend

COPY packages/backend ./packages/backend

EXPOSE 8000
CMD ["npm", "start", "--workspace=backend"]

# Construir imagen
# docker build -f packages/backend/Dockerfile -t codigo_a_voluntad_backend .

#Correr el container
# docker run -p 8000:8000 --env-file packages/backend/.env.example codigo_a_voluntad_backend
