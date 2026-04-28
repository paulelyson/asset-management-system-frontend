
# $ docker build --no-cache  -t asset-mgt-frontend . 
# (run this command in the frontend directory) asset-mgt-frontend is the name of the image that will be built. You can choose any name you like. 

# Local testing
# $ docker run -p 4200:80 --name asset-mgt-frontend asset-mgt-frontend
# no -d, so you see logs live, good for debugging

# Production / server
# $ docker run -d -p 80:80 --name asset-mgt-frontend asset-mgt-frontend
# -d so it runs in background and stays up
# port 80 so users hit http://yourdomain.com directly


# Stage 1: Build Angular
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts && npm rebuild esbuild
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve via nginx
FROM nginx:alpine
COPY --from=builder /app/dist/asset-management-system/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80