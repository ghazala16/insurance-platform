# 🛡️ InsureFlow — Cloud-Based Insurance Management Platform

A production-grade, full-stack insurance policy management system built with **Angular 17**, **Spring Boot 3**, **MongoDB**, deployed on **Microsoft Azure** with full **CI/CD via GitHub Actions** and **Docker/Kubernetes** support.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Cloud                              │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Azure Static │    │  Azure App   │    │  Azure Cosmos DB │  │
│  │  Web Apps    │───▶│  Service /   │───▶│  (MongoDB API)   │  │
│  │  (Angular)   │    │  AKS         │    │                  │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘  │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │ Azure Service   │                          │
│                    │ Bus (Async)     │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, Angular Material, RxJS |
| Backend | Java 17, Spring Boot 3, Spring Security |
| Auth | OAuth2 / JWT + Okta / Azure AD (OIDC) |
| Database | MongoDB (Azure Cosmos DB with Mongo API) |
| Messaging | Azure Service Bus (async policy processing) |
| Cloud | Microsoft Azure (App Service, AKS, Static Web Apps) |
| DevOps | Docker, Docker Compose, Kubernetes, GitHub Actions CI/CD |
| Monitoring | Azure Application Insights, Micrometer |

---

## 📁 Project Structure

```
insurance-platform/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/swissre/insurance/
│   │   ├── config/           # Security, CORS, Azure configs
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── exception/        # Global exception handling
│   │   ├── model/            # MongoDB documents
│   │   ├── repository/       # Spring Data Mongo repos
│   │   ├── security/         # JWT filters, OAuth2
│   │   └── service/          # Business logic
│   └── Dockerfile
├── frontend/                 # Angular application
│   ├── src/app/
│   │   ├── core/             # Guards, interceptors, services
│   │   ├── features/         # Auth, Dashboard, Policies
│   │   └── shared/           # Reusable components & models
│   ├── Dockerfile
│   └── nginx.conf
├── infra/
│   ├── docker/               # Docker Compose
│   ├── k8s/                  # Kubernetes manifests
│   └── terraform/            # Azure IaC (optional)
└── .github/workflows/        # CI/CD pipelines
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Java 17+
- Node 18+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Run with Docker Compose
```bash
git clone https://github.com/yourusername/insurance-platform.git
cd insurance-platform
docker-compose -f infra/docker/docker-compose.yml up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- MongoDB: localhost:27017

### Run Individually

**Backend:**
```bash
cd backend
./mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
```

---

## 🔐 Authentication Flow

```
User → Angular App → POST /auth/login
                   ← JWT Access Token (15min) + Refresh Token (7d)
                   → API calls with Bearer token
                   → Token refresh via /auth/refresh
```

Supports:
- Local JWT authentication
- OAuth2 with Azure AD (OIDC)
- OAuth2 with Okta

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login & get JWT |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/policies` | List all policies |
| POST | `/api/v1/policies` | Create policy |
| GET | `/api/v1/policies/{id}` | Get policy by ID |
| PUT | `/api/v1/policies/{id}` | Update policy |
| DELETE | `/api/v1/policies/{id}` | Delete policy |
| GET | `/api/v1/policies/status/{status}` | Filter by status |
| GET | `/api/v1/dashboard/stats` | Dashboard metrics |

---

## ☁️ Azure Deployment

### 1. App Service (Backend)
```bash
az webapp create --resource-group insurance-rg \
  --plan insurance-plan --name insureflow-api \
  --runtime "JAVA:17-java17"

az webapp deployment source config-zip \
  --resource-group insurance-rg --name insureflow-api \
  --src target/insurance-platform.jar
```

### 2. Static Web Apps (Frontend)
```bash
az staticwebapp create --name insureflow-ui \
  --resource-group insurance-rg \
  --source https://github.com/yourusername/insurance-platform \
  --location "eastus" --branch main \
  --app-location "/frontend" --output-location "dist/frontend"
```

### 3. Kubernetes (AKS)
```bash
kubectl apply -f infra/k8s/
```

---

## 🔄 Async Processing (Azure Service Bus)

Policy creation triggers an async workflow:
1. Policy saved to MongoDB
2. Message published to Service Bus queue
3. `PolicyProcessorService` consumes message
4. Risk assessment runs asynchronously
5. Policy status updated (PENDING → ACTIVE)
6. Notification sent to user

---

## 📈 Monitoring

- **Health Check**: `GET /actuator/health`
- **Metrics**: `GET /actuator/metrics`
- **Azure App Insights**: Auto-instrumented via `applicationinsights-agent`

---

## 🧪 Testing

```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests  
cd frontend && ng test --watch=false --code-coverage
```

---

## 👨‍💻 Interview Talking Points

1. **Why microservices?** Each bounded context (auth, policies, notifications) can scale independently
2. **Why Azure Service Bus?** Decouples policy creation from risk processing; resilient to downstream failures
3. **Why JWT + Refresh tokens?** Short-lived access tokens limit exposure; refresh tokens enable seamless UX
4. **Why Cosmos DB (MongoDB API)?** Schema flexibility for varied insurance product structures; global distribution
5. **CI/CD strategy:** PR triggers tests → main branch triggers build+push to ACR → AKS rolling deploy
