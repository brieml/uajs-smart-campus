# =============================================================
# UAJS Smart Campus - Frontend
# Dockerfile multi-stage: build de la SPA con Node y servido con
# Nginx en una imagen final liviana.
# =============================================================

# ---------- Etapa 1: build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero para aprovechar la cache de capas
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente y construir la app
COPY . .
RUN npm run build

# ---------- Etapa 2: servidor de producción ----------
FROM nginx:1.27-alpine AS production

# Configuración de Nginx para SPA (fallback a index.html en rutas de React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar únicamente el resultado de la build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
