# Smart Access Backend Implementation TODO

## Approved Plan Steps (In Progress)

### 1. Dependencies & Setup ✅ [PENDING]
- [x] Update package.json (add jsonwebtoken, bcryptjs)
- [x] Implement config/db.js (mongoose connect)
- [ ] `npm install`

### 2. Models ✅ ✅
- [x] models/User.model.js (w/ role enum, bcrypt)
- [x] Update models/Log.model.js (add method field)

### 3. Server & DB Connect ✅ ✅
- [x] Update server.js (connectDB, middleware)

### 4. JWT Auth ✅ ✅
- [x] services/auth.service.js (register/login/verify)
- [x] controllers/auth.controller.js
- [x] routes/auth.routes.js (/api/auth/register, /login)

### 5. Auth Middleware ✅ ✅
- [x] middleware/auth.middleware.js (verifyToken, roleGuard)

### 6. User Management ✅ ✅
- [x] services/user.service.js
- [x] controllers/user.controller.js
- [x] routes/user.routes.js (/api/users CRUD, protected)

### 7. Access Events ✅ ✅
- [x] controllers/accessEvent.controller.js
- [x] routes/accessEvent.routes.js (/api/access-event)
- [x] Refactor old /login (use new access-event)

### 8. Enhanced Logs ✅ ✅
- [x] Update services/log.service.js (DB + filters)
- [x] Update controllers/log.controller.js (query filters)

### 9. Protection & Polish ✅ ✅ ✅
- [x] Protect routes (/logs /alerts admin/guard)
- [x] Seed script.js
- [x] Ready for testing

**Legend**: Sections marked when started, individual checkboxes ticked when done.

