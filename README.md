# Sistema de Microservicios de Pagos - Prueba Técnica

Este repositorio contiene la solución completa a la prueba técnica para la posición de Backend Developer. El sistema permite gestionar transacciones y liquidaciones de pagos de forma segura y escalable.

## 🚀 Cómo ejecutar el proyecto (Docker)

La forma más sencilla de levantar todo el sistema es utilizando Docker Compose:

1. Asegúrate de tener Docker y Docker Compose instalados.
2. Clona el repositorio.
3. Ejecuta el comando:
   ```bash
   docker-compose up --build
   ```
4. El sistema estará disponible en:
   - **API Gateway:** `http://localhost:3000`
   - **Payment Service (Directo):** `http://localhost:3001`
   - **Health Check:** `http://localhost:3000/api/v1/payments/health`

## 🏗️ Arquitectura
Para una explicación detallada del diseño, patrones de resiliencia y comunicación por eventos, consulta:
👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

## 🛡️ Seguridad
- **JWT:** Protección de rutas mediante tokens.
- **API Key:** Header `x-api-key` validado contra la base de datos de Merchants.
- **Rate Limiting:** Máximo 100 peticiones cada 15 minutos por IP.
- **Circuit Breaker:** Protección contra fallos en cascada entre el Gateway y el servicio de pagos.

## 🧪 Pruebas Rápidas (PowerShell)

**Crear una transacción:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/payments/transactions" -Method Post -Headers @{ "x-api-key" = "ff4ae15c-cfed-482a-a0cb-c32a0f89769b" } -ContentType "application/json" -Body '{"amount": 100.0, "currency": "GTQ", "type": "payin", "metadata": {"order_id": "TEST-1"}}'
```

**Ver transacciones (Paginado):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/payments/transactions?page=1&limit=10" -Method Get -Headers @{ "x-api-key" = "ff4ae15c-cfed-482a-a0cb-c32a0f89769b" }
```

## 🛠️ Stack Tecnológico
- **Node.js / TypeScript**
- **NestJS** (Services)
- **Express.js** (Gateway)
- **Prisma ORM**
- **PostgreSQL**
- **Redis** (Pub/Sub)
- **Docker / Docker Compose**
