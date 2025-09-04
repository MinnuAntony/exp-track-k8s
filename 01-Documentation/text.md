
# Expense Tracker – Kubernetes Deployment Documentation

## Part 1 – Project Overview

The **Expense Tracker** is a cloud-native web application built using a microservices architecture. Its purpose is to allow users to register, manage their accounts, and track expenses seamlessly.

The system is made up of four core components:

* **Frontend** (React + Nginx) – the user-facing application.
* **User Service** (Python, FastAPI) – handles user registration and authentication.
* **Expense Service** (Go) – handles expense tracking and reporting.
* **Database** (MySQL) – stores persistent user and expense data.

Each service is containerized using Docker and deployed to Kubernetes. To make the deployment production-ready, we implemented:

* **Ingress Controller** for routing external traffic.
* **Persistent storage** for MySQL.
* **ConfigMaps & Secrets** for environment configuration and credentials.
* **Liveness/Readiness probes** for health monitoring.
* **Horizontal Pod Autoscalers (HPA)** for scaling.
* **Network Policies** for enforcing zero-trust communication.

---

## Part 2 – Kubernetes Manifests Documentation

This section explains the Kubernetes manifests stored in the `k8s/` folder, with code snippets and explanations for each resource.

---

### 1. Frontend

The frontend is deployed as a **Deployment** and exposed using a **Service**.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: frontend
        image: frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
```

* **Replicas = 2** for high availability.
* **Probes** ensure only healthy pods receive traffic.

The service is simple:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
```

---

### 2. User Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        envFrom:
        - secretRef:
            name: mysql-secret
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /users
            port: 5000
        readinessProbe:
          httpGet:
            path: /users
            port: 5000
```

* Uses **Secrets** for DB credentials.
* Probes check `/users` endpoint.

Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  type: ClusterIP
  ports:
  - port: 5000
    targetPort: 5000
```

---

### 3. Expense Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expense-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: expense-service
        image: expense-service:latest
        envFrom:
        - secretRef:
            name: mysql-secret
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /expenses
            port: 8080
        readinessProbe:
          httpGet:
            path: /expenses
            port: 8080
```

* Talks to both **user-service** and **MySQL**.

Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: expense-service
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
```

---

### 4. Database (MySQL)

We use a **StatefulSet** for stable storage and identity.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: "mysql"
  replicas: 1
  template:
    spec:
      containers:
      - name: mysql
        image: mysql:8.1
        envFrom:
        - secretRef:
            name: mysql-secret
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

* **Secrets** manage credentials.
* **PVC** ensures data persists across pod restarts.

Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: None
  ports:
  - port: 3306
```

---

### 5. Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
    - http:
        paths:
          - path: /()(.*)
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /user-service(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: user-service
                port:
                  number: 5000
          - path: /expense-service(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: expense-service
                port:
                  number: 8080
```

* Routes traffic to frontend, user-service, and expense-service.
* Used with **NGINX Ingress Controller** (running as NodePort).

---

### 6. Autoscaling (HPA)

Example: User Service HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  minReplicas: 2
  maxReplicas: 4
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

* Each service has its own HPA.
* Scales automatically based on CPU/memory load.

---

### 7. Network Policies

We start with **default-deny-all**:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

Then allow specific communication:

* **Frontend Policy** → Allows ingress from Ingress Controller, egress to backend services.
* **User Policy** → Allows ingress from frontend, egress to MySQL.
* **Expense Policy** → Allows ingress from frontend & user-service, egress to MySQL.
* **MySQL Policy** → Only allows ingress from user-service and expense-service.

---

## End-to-End Flow

1. User hits browser → request enters cluster through Ingress (NodePort).
2. Ingress routes traffic:

   * `/` → frontend
   * `/user-service` → user-service
   * `/expense-service` → expense-service
3. Backends talk to **MySQL** using credentials from Secrets.
4. Network Policies enforce strict communication.
5. HPAs handle scaling.
6. PV/PVC ensure MySQL data persists.

---
