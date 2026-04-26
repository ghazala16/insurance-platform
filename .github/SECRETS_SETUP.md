# GitHub Actions — Required Secrets Setup

Go to: GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

## Required Secrets

| Secret Name | Description | How to get it |
|-------------|-------------|---------------|
| `ACR_USERNAME` | Azure Container Registry username | Azure Portal → ACR → Access Keys |
| `ACR_PASSWORD` | Azure Container Registry password | Azure Portal → ACR → Access Keys |
| `AZURE_CREDENTIALS` | Azure service principal JSON | See below |

## Creating AZURE_CREDENTIALS

```bash
az ad sp create-for-rbac \
  --name "insureflow-github-actions" \
  --role contributor \
  --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/insureflow-rg \
  --sdk-auth
```

Copy the full JSON output and paste as the `AZURE_CREDENTIALS` secret value.

## Azure Resources to Create

```bash
# Resource group
az group create --name insureflow-rg --location eastus

# Container Registry
az acr create --resource-group insureflow-rg \
  --name insureflowacr --sku Basic

# AKS cluster (with ACR integration)
az aks create \
  --resource-group insureflow-rg \
  --name insureflow-aks \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --attach-acr insureflowacr \
  --enable-managed-identity \
  --generate-ssh-keys

# Azure Cosmos DB (MongoDB API)
az cosmosdb create \
  --name insureflow-cosmos \
  --resource-group insureflow-rg \
  --kind MongoDB \
  --server-version 6.0

# Azure Service Bus
az servicebus namespace create \
  --name insureflow-sb \
  --resource-group insureflow-rg \
  --sku Standard

az servicebus queue create \
  --name policy-processing-queue \
  --namespace-name insureflow-sb \
  --resource-group insureflow-rg
```

## Apply K8s Secrets (one-time setup)

```bash
# Get AKS credentials
az aks get-credentials --resource-group insureflow-rg --name insureflow-aks

# Create namespace
kubectl apply -f infra/k8s/namespace-and-config.yml

# Create secrets (replace with real values)
kubectl create secret generic insureflow-secrets \
  --namespace insureflow \
  --from-literal=mongodb-uri="<COSMOS_DB_CONNECTION_STRING>" \
  --from-literal=jwt-secret="<YOUR_32_CHAR_SECRET>" \
  --from-literal=service-bus-connection-string="<SERVICE_BUS_CONNECTION_STRING>"
```
