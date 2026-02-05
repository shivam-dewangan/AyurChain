# Backend Migration Plan - Supabase to Node.js + MongoDB

## Phase 1: Backend Setup
- [x] Plan and design the backend structure
- [x] Create backend folder structure
- [x] Create config/db.js - MongoDB connection
- [x] Create config/env.js - Environment variables
- [x] Create models/User.js
- [x] Create models/FarmerDetail.js
- [x] Create models/CompanyDetail.js
- [x] Create models/Batch.js
- [x] Create models/Purchase.js
- [x] Create models/BatchChange.js
- [x] Create models/AIAnalysis.js
- [x] Create models/FraudDetection.js
- [x] Create models/Notification.js

## Phase 2: Routes & Middleware
- [x] Create middleware/auth.js - JWT authentication
- [x] Create middleware/role.js - Role-based access
- [x] Create routes/auth.js - Authentication routes
- [x] Create routes/batches.js - Batch CRUD operations
- [x] Create routes/purchases.js - Purchase operations
- [x] Create routes/profiles.js - Profile management
- [x] Create routes/admin.js - Admin operations
- [x] Create routes/ai.js - AI analysis routes

## Phase 3: Services
- [x] Create services/qrService.js - QR code generation
- [x] Create services/aiService.js - AI quality analysis
- [x] Create services/inventoryService.js - Inventory management

## Phase 4: Main Server
- [x] Create server.js - Main Express server with WebSocket

## Phase 5: Frontend Updates
- [ ] Create src/api/client.js - New API client
- [ ] Update src/services/inventoryService.ts
- [ ] Update src/services/aiService.ts
- [ ] Update src/services/qrService.ts
- [ ] Update src/pages/Auth.tsx
- [ ] Update src/pages/FarmerDashboard.tsx
- [ ] Update src/pages/FarmerProfile.tsx
- [ ] Update src/pages/CreateBatch.tsx
- [ ] Update src/pages/BatchSearch.tsx
- [ ] Update src/pages/AdminDashboard.tsx
- [ ] Update src/pages/CompanyDashboard.tsx
- [ ] Update src/components/PurchasesList.tsx
- [ ] Update src/components/AIQualityAnalysis.tsx
- [ ] Update other components using Supabase

## Phase 6: Testing & Cleanup
- [ ] Test all API endpoints
- [ ] Test frontend integration
- [ ] Remove Supabase configuration files
- [ ] Update package.json with backend dependencies

