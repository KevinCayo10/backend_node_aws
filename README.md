## Backend B2B - Monorepo

Sistema mínimo con dos APIs (Customers, Orders), base MySQL y un Lambda Orchestrator.

### Estructura
- `customer-api/`: API de clientes (puerto 3001)
- `orders-api/`: API de productos y órdenes (puerto 3002)
- `lambda-orchestrator/`: Lambda HTTP que orquesta crear+confirmar orden
- `db/`: SQL de esquema y datos de ejemplo (`schema.sql`, `seed.sql`)
- `docker-compose.yml`: levanta MySQL + APIs

### Requisitos
- Docker y Docker Compose
- Node.js 20.x para desarrollo local

### Variables de entorno (referencia)
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
  - `CUSTOMER_API_URL=http://customers-api:3001/api/v1` (en Docker)
- Lambda Orchestrator (local serverless-offline)
  - `CUSTOMERS_API_BASE=http://127.0.0.1:3001/api/v1`
  - `ORDERS_API_BASE=http://127.0.0.1:3002/api/v1`
  - `SERVICE_TOKEN=1234567890`

### Levantar con Docker Compose
1) Desde la raíz del repo:
```bash
docker-compose build
docker-compose up -d
```
2) Verificar salud:
- Customers: `http://localhost:3001/api/v1/health`
- Orders: `http://localhost:3002/api/v1/health`

La base MySQL expone host `localhost:3308` (interno 3306) y se inicializa con `db/schema.sql` + `db/seed.sql`.

### Endpoints principales
- Customers API (prefijo `http://localhost:3001/api/v1`)
  - `POST /customers` crear { name, email, phone }
  - `GET /customers/:id`
  - `GET /customers?search=&cursor=&limit=`
  - `PUT /customers/:id`
  - `DELETE /customers/:id`
  - `GET /customers/internal/:id` requiere `Authorization: Bearer SERVICE_TOKEN`

- Orders API (prefijo `http://localhost:3002/api/v1`)
  - Productos: `POST /products`, `PUT /products/:id`, `GET /products/:id`, `GET /products?search=&cursor=&limit=`
  - Órdenes:
    - `POST /orders` body `{ customerId, items:[{ productId, qty }] }`
    - `GET /orders/:id`
    - `GET /orders?status=&from=&to=&cursor=&limit=`
    - `POST /orders/:id/confirm` con header `X-Idempotency-Key`
    - `POST /orders/:id/cancel`

### Validación y seguridad
- Validación con Zod en Customers, Orders y Products (params, query y body).
- JWT simple (`Authorization: Bearer <jwt>`) para endpoints protegidos; token de servicio para endpoint interno de Customers.

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
1) Instalar y levantar en `lambda-orchestrator/`:
```bash
npm install
npm run dev
```
El orquestador expone `http://127.0.0.1:4000` y usa como backends las APIs locales.

2) Invocar flujo completo (crear + confirmar):
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

### Troubleshooting
- 404 Not Found al orquestar: asegúrate que el orquestador corre en `127.0.0.1:4000` y que `ORDERS_API_BASE/CUSTOMERS_API_BASE` apuntan a `127.0.0.1` (evita IPv6 y colisiones de puertos).
- Proxy corporativo: exporta `NO_PROXY=localhost,127.0.0.1,::1` o usa cliente HTTP con `proxy: false` (ya aplicado en el orquestador).

### OpenAPI
- Se recomienda documentar cada servicio con OpenAPI 3.0 (archivo `openapi.yaml` por servicio). Pendiente de agregar.

### Deploy (opcional)
- Orquestador: Serverless Framework (`npm run deploy`) configurando `CUSTOMERS_API_BASE` y `ORDERS_API_BASE` públicos.
- APIs: contenedores Docker o plataforma preferida, con mismas variables de entorno.

### Licencia
MIT / ISC


