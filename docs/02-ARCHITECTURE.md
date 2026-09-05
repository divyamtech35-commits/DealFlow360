# DealFlow360 - Architecture

## Technology Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui patterns
- **Backend**: Node.js, Express.js, TypeScript, REST API (JSON)
- **Infrastructure**: Appwrite (Authentication, Database, Realtime, Storage)

## Layered Backend Flow
```
Client (Next.js)
    ↓  REST API (/api/v1)
Routes
    ↓
Middleware (Auth, RBAC, Validation)
    ↓
Controllers (Thin HTTP Request/Response Handlers)
    ↓
Services (Business Workflow Orchestrators)
    ↓
Engines (Deterministic Domain Rules)
    ├── Pricing Engine
    ├── Discount Engine
    ├── Risk Engine
    ├── Approval Engine
    ├── Recommendation Engine
    ├── Fulfillment Engine
    ├── Billing Engine
    └── Deal Health Engine
    ↓
Repositories (Appwrite Database Access)
    ↓
Appwrite SDK (node-appwrite)
```
