# 🏥 MediMesh – Hospital Management Microservices

> **Smart Hospital Management System** — A MERN-stack microservices platform designed for hands-on Kubernetes learning using kubeadm on AWS EC2.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│                    (Browser / Mobile)                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP (Port 3000 / NodePort 30080)
┌───────────────────────▼─────────────────────────────────────────┐
│              medimesh-frontend (React + Nginx)                   │
│              Landing Page → Login → Dashboard                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │ /api/* proxy
┌───────────────────────▼─────────────────────────────────────────┐
│                  medimesh-bff (Port 5010)                        │
│          Backend-for-Frontend — Aggregates all services           │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┘
   │      │      │      │      │      │      │      │      │
┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐
│Auth ││User ││Doc  ││Appt ││Vit  ││Phar ││Amb  ││Comp ││Forum│
│5001 ││5002 ││5003 ││5004 ││5005 ││5006 ││5007 ││5008 ││5009 │
└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘
   │      │      │      │      │      │      │      │      │
┌──▼──────▼──────▼──────▼──────▼──────▼──────▼──────▼──────▼──┐
│                    MongoDB (Port 27017)                        │
│              9 databases (one per service)                     │
│           StatefulSet + PersistentVolume (K8s)                 │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
MediMesh/
├── services/
│   ├── medimesh-auth/           # JWT auth, roles, seed admin+doctors
│   ├── medimesh-user/           # Patient dashboard proxy
│   ├── medimesh-doctor/         # Doctor profiles + availability
│   ├── medimesh-appointment/    # Booking flow (CRUD)
│   ├── medimesh-vitals/         # BP, heart rate tracking
│   ├── medimesh-pharmacy/       # Medicine inventory (admin-only)
│   ├── medimesh-ambulance/      # Fleet availability tracking
│   ├── medimesh-complaint/      # User complaints (admin-only mgmt)
│   └── medimesh-forum/          # Community posts + discussions
├── medimesh-bff/                # Backend-for-Frontend aggregator
├── medimesh-frontend/           # React SPA (CRA + Nginx)
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── mongodb-pv-pvc.yaml
│   ├── mongodb-statefulset.yaml
│   ├── services-deployment.yaml
│   └── frontend-deployment.yaml
├── docker-compose.yml
└── README.md
```

---

## 🧩 Services Overview

| # | Service | Port | Database | Description |
|---|---------|------|----------|-------------|
| 1 | medimesh-auth | 5001 | medimesh-auth-db | JWT login/register, roles (admin/doctor/patient) |
| 2 | medimesh-user | 5002 | medimesh-user-db | Patient profiles, proxy to doctor/pharmacy/ambulance |
| 3 | medimesh-doctor | 5003 | medimesh-doctor-db | Doctor profiles, 5 seeded defaults, availability |
| 4 | medimesh-appointment | 5004 | medimesh-appointment-db | Book (patient) / Approve-Reject (doctor) |
| 5 | medimesh-vitals | 5005 | medimesh-vitals-db | BP, heart rate — doctors write, patients read |
| 6 | medimesh-pharmacy | 5006 | medimesh-pharmacy-db | Medicine inventory — **admin-only** writes |
| 7 | medimesh-ambulance | 5007 | medimesh-ambulance-db | Fleet — available/busy status |
| 8 | medimesh-complaint | 5008 | medimesh-complaint-db | Raise (users) / Manage (**admin-only**) |
| 9 | medimesh-forum | 5009 | medimesh-forum-db | Community posts, likes, discussions |
| 10 | medimesh-bff | 5010 | — | Aggregator for all services |
| 11 | medimesh-frontend | 3000 | — | React SPA with Nginx |

---

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `123456` |
| Doctor | `doctor1` through `doctor5` | `pass123` |

> ⚠️ Admin registration is **blocked** at API level. Only the seeded admin exists.

---

## 🎨 UI Theme

- **Primary Blue:** `#2563EB`
- **Dark Blue:** `#1E40AF`
- **Light Background:** `#EFF6FF`
- **Status Colors:** Approved=Green, Pending=Orange, Rejected=Red

---

## 🐳 Docker Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run

```bash
# Clone and navigate
cd MediMesh

# Build and start all services
docker-compose up --build

# Access
# Frontend:  http://localhost:3000
# BFF API:   http://localhost:5010
```

### Stop

```bash
docker-compose down
# To also remove volumes:
docker-compose down -v
```

---

## ☸️ Kubernetes Deployment Guide

### Prerequisites
- kubeadm cluster (1 master + 1-2 workers on AWS EC2)
- Docker installed on all nodes
- kubectl configured

### Step 1: Build & Push Images

```bash
# Build all images (on master node or a build machine)
docker build -t medimesh-auth:latest ./services/medimesh-auth
docker build -t medimesh-user:latest ./services/medimesh-user
docker build -t medimesh-doctor:latest ./services/medimesh-doctor
docker build -t medimesh-appointment:latest ./services/medimesh-appointment
docker build -t medimesh-vitals:latest ./services/medimesh-vitals
docker build -t medimesh-pharmacy:latest ./services/medimesh-pharmacy
docker build -t medimesh-ambulance:latest ./services/medimesh-ambulance
docker build -t medimesh-complaint:latest ./services/medimesh-complaint
docker build -t medimesh-forum:latest ./services/medimesh-forum
docker build -t medimesh-bff:latest ./medimesh-bff
docker build -t medimesh-frontend:latest ./medimesh-frontend

# For multi-node clusters, push to a registry (DockerHub / ECR)
# docker tag medimesh-auth:latest <your-registry>/medimesh-auth:latest
# docker push <your-registry>/medimesh-auth:latest
# (repeat for all images)
```

### Step 2: Apply K8s Manifests (in order)

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Secrets & ConfigMap
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml

# 3. MongoDB Storage
kubectl apply -f k8s/mongodb-pv-pvc.yaml

# 4. MongoDB StatefulSet
kubectl apply -f k8s/mongodb-statefulset.yaml

# 5. All Backend + BFF Services
kubectl apply -f k8s/services-deployment.yaml

# 6. Frontend (NodePort)
kubectl apply -f k8s/frontend-deployment.yaml
```

### Step 3: Verify

```bash
# Check all pods
kubectl get pods -n medimesh

# Check services
kubectl get svc -n medimesh

# Check logs
kubectl logs -n medimesh deployment/medimesh-auth

# Access frontend
# http://<NodeIP>:30080
```

---

## 🌐 Frontend Exposure Upgrade Path

### Phase 1 (Current): NodePort
- Frontend exposed on `NodePort:30080`
- Direct access: `http://<EC2-Public-IP>:30080`

### Phase 2: Ingress Controller
```yaml
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/baremetal/deploy.yaml

# Then create an Ingress resource:
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: medimesh-ingress
  namespace: medimesh
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: medimesh.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: medimesh-frontend-svc
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: medimesh-bff-svc
                port:
                  number: 5010
```

---

## 🧠 Kubernetes Concepts Practiced

| Concept | Where Used |
|---------|-----------|
| **Namespace** | `medimesh` namespace isolates all resources |
| **Deployments** | All 10 app services + frontend |
| **StatefulSet** | MongoDB with stable network identity |
| **ConfigMap** | Service URLs, MongoDB host config |
| **Secret** | JWT secret, admin credentials (base64) |
| **PersistentVolume** | 5Gi hostPath for MongoDB data |
| **PersistentVolumeClaim** | Bound to PV for MongoDB pod |
| **ClusterIP Service** | Internal communication between services |
| **NodePort Service** | External access to frontend (30080) |
| **Resource Requests/Limits** | CPU/Memory on every container |

---

## 📡 Service Interaction Flow

```
Patient Register → medimesh-auth (POST /api/auth/register)
Patient Login    → medimesh-auth (POST /api/auth/login) → JWT Token
Book Appointment → medimesh-bff → medimesh-appointment (POST)
Doctor Approves  → medimesh-bff → medimesh-appointment (PATCH status)
Record Vitals    → medimesh-bff → medimesh-vitals (POST) [doctor-only]
View Pharmacy    → medimesh-bff → medimesh-pharmacy (GET) [all roles]
Add Medicine     → medimesh-bff → medimesh-pharmacy (POST) [admin-only]
File Complaint   → medimesh-bff → medimesh-complaint (POST) [any user]
Resolve Complaint→ medimesh-bff → medimesh-complaint (PATCH) [admin-only]
Forum Post       → medimesh-bff → medimesh-forum (POST) [any user]
Dashboard        → medimesh-bff → aggregates multiple services
```

---

## 📝 License

This project is for **educational/learning purposes only**. Not intended for production use.
