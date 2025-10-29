## Backend B2B — Monorepo

Un proyecto simple para probar un flujo B2B: dos APIs (Customers y Orders), una base MySQL y un Lambda que orquesta la creación y confirmación de órdenes.

### Qué hay adentro
- `customer-api/`: API de clientes (puerto 3001)
- `orders-api/`: API de productos y órdenes (puerto 3002)
- `lambda-orchestrator/`: Lambda HTTP que crea y confirma órdenes
- `db/`: SQL con tablas y datos de ejemplo (`schema.sql`, `seed.sql`)
- `docker-compose.yml`: orquesta MySQL + APIs

### Qué necesitas
- Docker y Docker Compose
- Node.js 20.x (si querés correr servicios fuera de Docker)

### Variables de entorno (de referencia)
- Customers API
  - `PORT=3001`
  - `DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT`
  - `JWT_SECRET=dev-secret`
  - `SERVICE_TOKEN=1234567890`
- Orders API
  - `PORT=3002`
  - `DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT`
  - `JWT_SECRET=dev-secret`
  - `SERVICE_TOKEN=1234567890`
  - `CUSTOMER_API_URL=http://customers-api:3001/api/v1` (dentro de Docker)
- Lambda Orchestrator (local con serverless-offline)
  - `CUSTOMERS_API_BASE=http://127.0.0.1:3001/api/v1`
  - `ORDERS_API_BASE=http://127.0.0.1:3002/api/v1`
  - `SERVICE_TOKEN=1234567890`

### Arranque con Docker Compose
Desde la raíz del repo:
```bash
docker compose build
docker compose up -d
```
Chequeos rápidos:
- Customers: `http://localhost:3001/api/v1/health`
- Orders: `http://localhost:3002/api/v1/health`

MySQL queda expuesto en `localhost:3308` (interno 3306) y se carga con `db/schema.sql` + `db/seed.sql`.

### Endpoints principales
- Customers API (`http://localhost:3001/api/v1`)
  - `POST /customers` crea { name, email, phone }
  - `GET /customers/:id`
  - `GET /customers?search=&cursor=&limit=`
  - `PUT /customers/:id`
  - `DELETE /customers/:id`
  - `GET /customers/internal/:id` requiere `Authorization: Bearer SERVICE_TOKEN`

- Orders API (`http://localhost:3002/api/v1`)
  - Productos: `POST /products`, `PUT /products/:id`, `GET /products/:id`, `GET /products?search=&cursor=&limit=`
  - Órdenes:
    - `POST /orders` body `{ customerId, items:[{ productId, qty }] }`
    - `GET /orders/:id`
    - `GET /orders?status=&from=&to=&cursor=&limit=`
    - `POST /orders/:id/confirm` con `X-Idempotency-Key`
    - `POST /orders/:id/cancel`

### Validación y seguridad
- Zod para validar params, query y body en las APIs.
- JWT simple (`Authorization: Bearer <jwt>`) en endpoints protegidos; token de servicio para el endpoint interno de Customers.

### Probar con cURL
- Crear cliente:
```bash
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{ "name": "ACME", "email": "ops@acme.com", "phone": "+1-555-0100" }'
```
- Crear orden:
```bash
curl -X POST http://localhost:3002/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{ "customerId": 1, "items": [{ "productId": 1, "qty": 2 }] }'
```
- Confirmar orden:
```bash
curl -X POST http://localhost:3002/api/v1/orders/1/confirm \
  -H "X-Idempotency-Key: abc-123"
```

### Lambda Orchestrator (local)
En `lambda-orchestrator/`:
```bash
npm install
npm run dev
```
Queda expuesto en `http://127.0.0.1:4000` y apunta a las APIs locales.

Flujo completo (crear + confirmar):
```bash
curl --location 'http://127.0.0.1:4000/orchestrator/create-and-confirm-order' \
  --header 'Content-Type: application/json' \
  --data '{
    "customer_id": 1,
    "items": [{ "product_id": 1, "qty": 2 }],
    "idempotency_key": "abc-123",
    "correlation_id": "req-001"
  }'
```

### Si algo no sale a la primera
- ¿404 al orquestar? Suele ser un tema de puertos o de la URL base. El orquestador corre en `127.0.0.1:4000` y las APIs en `127.0.0.1:3001/3002`.
- ¿Ambiente con proxy? Ayuda tener `NO_PROXY=localhost,127.0.0.1,::1`. El orquestador ya usa un cliente HTTP con `proxy: false`.

### OpenAPI
Cada servicio incluye un `openapi.yaml` y una UI en:
- Customers: `http://localhost:3001/api/v1/docs`
- Orders: `http://localhost:3002/api/v1/docs`

### Deploy (opcional)
- Orquestador con Serverless (`npm run deploy`). Para producción, las variables `CUSTOMERS_API_BASE` y `ORDERS_API_BASE` deberían apuntar a URLs públicas.
- Las APIs pueden ir en contenedores o en tu plataforma preferida, reutilizando las mismas variables.

### Licencia
MIT / ISC


