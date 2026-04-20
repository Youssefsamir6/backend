# Smart Secure Campus - Backend

Smart Access Backend with Face Recognition, Real-time Logs/Alerts via Socket.io, MongoDB.

## Features
- Face recognition (Python face_recognition + OpenCV)
- Device auth (API keys)
- Real-time dashboard (Socket.io rooms 'logs')
- Admin user/face management
- Access logs + auto alerts
- Multer image upload (base64/multipart)

## Quick Start

### 1. Backend
```bash
cp .env.example .env  # Edit MONGODB_URI, JWT_SECRET
npm install
node seed.js  # Seed users w/ face data
npm start     # http://localhost:3000
```

### 2. AI Worker
```bash
cd ai-worker
pip install -r requirements.txt
python app.py  # http://localhost:5000/health
```

### 3. Camera Worker
```bash
cd ai-worker
python camera_worker.py  # Sends frames to backend
```

## Env Vars
See [.env.example](.env.example)

## API Endpoints

### Device / Camera
```
POST /api/ai/device/smart-access
X-API-Key: dev-key-123
Content-Type: multipart/form-data

- image (file or base64)
- deviceId (string)
- gateName (string)
```
Response: `{decision: {confidence, userId?}, access: {status: 'authorized'}}`

### Admin
```
Auth Bearer token (admin role)

POST /api/users/:id/face-images
- images[] (files) or image (base64)
```
Extracts embedding via AI.

GET /api/logs?deviceId=cam-main&confidence_min=0.8&startDate=2024-...

## Test Curl
```bash
curl -X POST http://localhost:3000/api/ai/device/smart-access \\
  -H \"X-API-Key: dev-key-123\" \\
  -F \"image=@test.jpg\" \\
  -F \"deviceId=cam-main-gate\" \\
  -F \"gateName=Main Gate\"
```

## Full Flow
1. Camera captures → POST /device/smart-access
2. Backend → AI worker /recognize → decision/log/socket emit
3. Dashboard joins 'logs' room → real-time updates

## Socket Rooms
- 'logs': access_event, alert events

## DB: MongoDB/Mongoose
No migration needed.

## Prod
- Dockerize backend/AI/camera
- MongoDB Atlas (vector search for embeddings)
- Nodemailer for alerts (add SMTP)

Done ✅

