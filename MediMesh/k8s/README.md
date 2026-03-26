# 🏥 MediMesh — Kubernetes Deployment Guide

Production-ready Kubernetes configuration for the MediMesh Hospital Management System microservices architecture.

---

## 📁 Folder Structure

```
k8s/
├── namespace.yaml                          # Dedicated namespace
├── configmap.yaml                          # Non-sensitive configuration
├── secret.yaml                             # Sensitive credentials (base64)
├── README.md                               # This file
├── mongodb/
│   ├── mongodb-pv-pvc.yaml                 # PersistentVolume + PVC (5Gi)
│   └── mongodb-statefulset.yaml            # StatefulSet + Headless Service
├── frontend/
│   └── frontend-deployment.yaml            # Deployment + NodePort Service
├── backend-services/
│   ├── auth-deployment.yaml                # Auth Service (port 5001)
│   ├── user-deployment.yaml                # User Service (port 5002)
│   ├── doctor-deployment.yaml              # Doctor Service (port 5003)
│   ├── appointment-deployment.yaml         # Appointment Service (port 5004)
│   ├── vitals-deployment.yaml              # Vitals Service (port 5005)
│   ├── pharmacy-deployment.yaml            # Pharmacy Service (port 5006)
│   ├── ambulance-deployment.yaml           # Ambulance Service (port 5007)
│   ├── complaint-deployment.yaml           # Complaint Service (port 5008)
│   ├── forum-deployment.yaml               # Forum Service (port 5009)
│   └── bff-deployment.yaml                 # BFF Gateway (port 5010)
├── services/
│   └── cluster-ip-services.yaml            # All 10 ClusterIP services
└── hpa/
    └── frontend-hpa.yaml                   # HPA for frontend (2→5 pods)
```

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────┐
                        │   AWS EC2 K8s Cluster    │
                        │  (1 Master + 2 Workers)  │
                        └─────────────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   NodePort :30080      │
                        │   medimesh-frontend    │  ← 2-5 replicas (HPA)
                        └───────────┬───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   ClusterIP :5010      │
                        │   medimesh-bff         │  ← 2 replicas
                        └───────────┬───────────┘
                                    │
          ┌────────┬────────┬───────┼────────┬────────┬────────┐
          ▼        ▼        ▼       ▼        ▼        ▼        ▼
       :5001    :5002    :5003   :5004    :5005    :5006    :5007-5009
       auth     user     doctor  appt     vitals   pharmacy  ambulance/
                                                             complaint/
                                                             forum
          └────────┴────────┴───────┼────────┴────────┴────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   MongoDB StatefulSet  │
                        │   ClusterIP :27017     │  ← Persistent (5Gi PV)
                        └───────────────────────┘
```

---

## 🚀 Step-by-Step Deployment

> **Important:** Apply resources in exactly this order to satisfy dependencies.

### Prerequisites

1. **Kubernetes cluster** with `kubectl` configured
2. **Metrics Server** installed (required for HPA):

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For kubeadm clusters, patch metrics-server to allow insecure TLS:
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# Verify metrics-server is running
kubectl get pods -n kube-system | grep metrics-server
```

### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Apply ConfigMap and Secrets

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### Step 3: Deploy MongoDB (Database First)

```bash
kubectl apply -f k8s/mongodb/mongodb-pv-pvc.yaml
kubectl apply -f k8s/mongodb/mongodb-statefulset.yaml
```

Wait for MongoDB to be ready:
```bash
kubectl get pods -n medimesh -l app=medimesh-mongodb --watch
# Wait until STATUS = Running and READY = 1/1
```

### Step 4: Deploy Backend Services

```bash
kubectl apply -f k8s/backend-services/
kubectl apply -f k8s/services/cluster-ip-services.yaml
```

Wait for all backend pods:
```bash
kubectl get pods -n medimesh -l tier=backend --watch
# Wait until all show STATUS = Running and READY = 1/1
```

### Step 5: Deploy Frontend

```bash
kubectl apply -f k8s/frontend/frontend-deployment.yaml
```

### Step 6: Apply Horizontal Pod Autoscaler

```bash
kubectl apply -f k8s/hpa/frontend-hpa.yaml
```

### 🎯 One-Shot Deployment (All at Once)

If you want to deploy everything in a single command:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb/
kubectl apply -f k8s/services/
kubectl apply -f k8s/backend-services/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/hpa/
```

---

## ✅ Verification Commands

### Check All Pods

```bash
# All pods in medimesh namespace
kubectl get pods -n medimesh -o wide

# By tier
kubectl get pods -n medimesh -l tier=frontend
kubectl get pods -n medimesh -l tier=backend
kubectl get pods -n medimesh -l tier=database
```

**Expected output:** Each backend service has **2 pods** running, frontend has **2+ pods**, MongoDB has **1 pod**.

### Check All Services

```bash
kubectl get svc -n medimesh
```

**Expected output:**

| Service Name               | Type      | Port  |
|----------------------------|-----------|-------|
| medimesh-frontend-svc      | NodePort  | 80:30080 |
| medimesh-bff-svc           | ClusterIP | 5010  |
| medimesh-auth-svc          | ClusterIP | 5001  |
| medimesh-user-svc          | ClusterIP | 5002  |
| medimesh-doctor-svc        | ClusterIP | 5003  |
| medimesh-appointment-svc   | ClusterIP | 5004  |
| medimesh-vitals-svc        | ClusterIP | 5005  |
| medimesh-pharmacy-svc      | ClusterIP | 5006  |
| medimesh-ambulance-svc     | ClusterIP | 5007  |
| medimesh-complaint-svc     | ClusterIP | 5008  |
| medimesh-forum-svc         | ClusterIP | 5009  |
| medimesh-mongodb           | ClusterIP (None) | 27017 |

### Check HPA

```bash
kubectl get hpa -n medimesh
```

**Expected output:**
```
NAME                    REFERENCE                      TARGETS   MINPODS   MAXPODS   REPLICAS
medimesh-frontend-hpa   Deployment/medimesh-frontend   <cpu>%/60%   2         5         2
```

### Check PV and PVC

```bash
kubectl get pv
kubectl get pvc -n medimesh
```

### Check Deployments

```bash
kubectl get deployments -n medimesh
```

### View Logs

```bash
# View logs for a specific service
kubectl logs -n medimesh -l app=medimesh-auth --tail=50

# Follow logs in real-time
kubectl logs -n medimesh -l app=medimesh-bff -f
```

---

## 🌐 Accessing the Application

### Via NodePort

The frontend is exposed on **NodePort 30080**. Access it using any worker node's public IP:

```
http://<WORKER_NODE_PUBLIC_IP>:30080
```

To find worker node IPs:
```bash
kubectl get nodes -o wide
```

Then use the **EXTERNAL-IP** or **INTERNAL-IP** (public IP of EC2 instance) with port `30080`.

> **AWS Security Group:** Ensure port `30080` is open in your EC2 Security Group for inbound TCP traffic.

---

## 📈 How Scaling Works (HPA)

### What is HPA?

The **Horizontal Pod Autoscaler (HPA)** automatically scales the number of frontend pods based on CPU utilization:

| Metric          | Value  |
|-----------------|--------|
| Min Replicas    | 2      |
| Max Replicas    | 5      |
| Target CPU      | 60%    |

### How It Works

1. **Metrics Server** continuously monitors CPU usage of frontend pods
2. If **average CPU > 60%**, HPA creates additional pods (up to 5)
3. If **average CPU < 60%**, HPA scales down pods (minimum 2)
4. Scaling decisions are made every **15 seconds** (default)

### Testing HPA

Generate load to trigger autoscaling:

```bash
# Run a load test from within the cluster
kubectl run -n medimesh load-test --rm -it --image=busybox -- /bin/sh -c "while true; do wget -q -O- http://medimesh-frontend-svc; done"
```

Monitor scaling:
```bash
# Watch HPA metrics
kubectl get hpa -n medimesh --watch

# Watch pod count increase
kubectl get pods -n medimesh -l app=medimesh-frontend --watch
```

---

## 🔐 Security Configuration

### ConfigMap (Non-Sensitive)

Stores service URLs and environment settings. View with:
```bash
kubectl get configmap medimesh-config -n medimesh -o yaml
```

### Secrets (Sensitive)

Stores JWT secret and MongoDB credentials (base64 encoded). View with:
```bash
kubectl get secret medimesh-secrets -n medimesh -o yaml
```

To update a secret value:
```bash
# Encode new value
echo -n "new-secret-value" | base64

# Edit the secret
kubectl edit secret medimesh-secrets -n medimesh
```

---

## 🔧 Troubleshooting

### Pod Not Starting

```bash
# Check pod status and events
kubectl describe pod <POD_NAME> -n medimesh

# Common issues:
# - ImagePullBackOff → Check Docker Hub image name
# - CrashLoopBackOff → Check logs: kubectl logs <POD_NAME> -n medimesh
# - Pending → Check resources: kubectl describe node
```

### Service Not Accessible

```bash
# Verify service endpoints
kubectl get endpoints -n medimesh

# Test from within the cluster
kubectl run -n medimesh debug --rm -it --image=busybox -- wget -qO- http://medimesh-bff-svc:5010
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
kubectl get pods -n medimesh -l app=medimesh-mongodb

# Check PVC is bound
kubectl get pvc -n medimesh

# Test MongoDB connection from another pod
kubectl run -n medimesh mongo-test --rm -it --image=mongo:7 -- mongosh mongodb://medimesh-mongodb:27017
```

### HPA Shows "Unknown" Metrics

```bash
# Ensure metrics-server is running
kubectl get pods -n kube-system | grep metrics-server

# Check metrics-server logs
kubectl logs -n kube-system -l k8s-app=metrics-server

# For kubeadm clusters, add --kubelet-insecure-tls flag
kubectl edit deployment metrics-server -n kube-system
# Add under spec.template.spec.containers[0].args:
#   - --kubelet-insecure-tls
```

### Rolling Update Issues

```bash
# Check rollout status
kubectl rollout status deployment/medimesh-auth -n medimesh

# Rollback if needed
kubectl rollout undo deployment/medimesh-auth -n medimesh

# View rollout history
kubectl rollout history deployment/medimesh-auth -n medimesh
```

---

## 🧹 Cleanup

Remove all MediMesh resources:

```bash
# Delete everything in the namespace
kubectl delete namespace medimesh

# Delete PersistentVolume (namespace-independent)
kubectl delete pv medimesh-mongodb-pv
```

---

## 📊 Key Features Summary

| Feature              | Implementation                          |
|----------------------|-----------------------------------------|
| High Availability    | 2 replicas per service (22 total pods)  |
| Auto-Scaling         | HPA on frontend (2→5 pods, 60% CPU)    |
| Data Persistence     | MongoDB StatefulSet + 5Gi PV/PVC       |
| Rolling Updates      | maxUnavailable: 1, maxSurge: 1         |
| Secure Config        | Secrets (base64) + ConfigMaps           |
| External Access      | NodePort 30080 for frontend             |
| Internal Networking  | ClusterIP services with DNS discovery   |
| Resource Management  | CPU/Memory requests and limits on all   |

---

## 📝 Docker Hub Images

All images are hosted on Docker Hub under `bharath44623`:

| Service      | Image                                         | Port |
|--------------|-----------------------------------------------|------|
| Frontend     | bharath44623/medimesh_medimesh-frontend        | 80   |
| BFF          | bharath44623/medimesh_medimesh-bff             | 5010 |
| Auth         | bharath44623/medimesh_medimesh-auth            | 5001 |
| User         | bharath44623/medimesh_medimesh-user            | 5002 |
| Doctor       | bharath44623/medimesh_medimesh-doctor          | 5003 |
| Appointment  | bharath44623/medimesh_medimesh-appointment     | 5004 |
| Vitals       | bharath44623/medimesh_medimesh-vitals          | 5005 |
| Pharmacy     | bharath44623/medimesh_medimesh-pharmacy        | 5006 |
| Ambulance    | bharath44623/medimesh_medimesh-ambulance       | 5007 |
| Complaint    | bharath44623/medimesh_medimesh-complaint       | 5008 |
| Forum        | bharath44623/medimesh_medimesh-forum           | 5009 |
| MongoDB      | mongo:7 (Official)                            | 27017|
