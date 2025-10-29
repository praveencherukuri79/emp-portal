# 🔄 Development Watch Mode Scripts

This document explains the different ways to run the Employee Portal in development mode with automatic file watching and hot reload.

## 🚀 Quick Start

The fastest way to start development:

```bash
# Option 1: Use npm script (recommended)
npm run watch

# Option 2: Use dedicated script files
./watch.bat          # Windows
./watch.sh           # Linux/Mac

# Option 3: Use enhanced script with better output
./scripts/dev-watch.bat    # Windows  
./scripts/dev-watch.sh     # Linux/Mac
./scripts/dev-watch.ps1    # PowerShell
```

## 📋 Available Scripts

### Main Development Scripts

| Script | Description | Ports |
|--------|-------------|-------|
| `npm run dev` | Start both servers (with browser auto-open) | Frontend: 4200, Backend: 3000 |
| `npm run watch` | **Watch mode** - Auto-restart on changes | Frontend: 4200, Backend: 3000 |
| `npm run build:watch` | Build both in watch mode | - |

### Individual Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:frontend` | Angular dev server with auto-open |
| `npm run dev:backend` | Express server with nodemon |
| `npm run watch:frontend` | Angular build in watch mode |
| `npm run watch:backend` | Express server with verbose logging |

### Testing Scripts

| Script | Description |
|--------|-------------|
| `npm run test:watch` | Run all tests in watch mode |
| `npm run test:frontend -- --watch` | Angular tests in watch mode |
| `npm run test:backend -- --watch` | Backend tests in watch mode |

## ✨ Features

### 🎯 **Watch Mode Features**
- ✅ **Auto-restart** on file changes
- ✅ **TypeScript compilation** for backend
- ✅ **Hot reload** for frontend
- ✅ **Colored console output** with prefixes
- ✅ **Verbose logging** for debugging
- ✅ **Error reporting** with source maps

### 🎨 **Frontend Watch Features**
- ✅ **Live reload** in browser
- ✅ **SCSS compilation**
- ✅ **TypeScript compilation**
- ✅ **Auto-open browser** on start
- ✅ **Source maps** for debugging

### 🖥️ **Backend Watch Features**
- ✅ **Auto-restart** on `.ts`, `.js`, `.json` changes
- ✅ **TypeScript compilation** via ts-node
- ✅ **Environment variable** reloading
- ✅ **Verbose logging** for file changes
- ✅ **Error stack traces**

## 🌐 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Angular development server |
| Backend API | http://localhost:3000/api | Express REST API |
| Health Check | http://localhost:3000/health | Server health status |

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
BACKEND_PORT=3000
FRONTEND_PORT=4200
MONGODB_URI=mongodb://localhost:27017/emp-portal
```

### Watch Mode Settings

**Frontend Watch Settings** (angular.json):
- Development configuration enabled
- Source maps enabled
- No output path deletion
- Live reload enabled

**Backend Watch Settings** (nodemon):
- Watch `backend/src/**/*`
- Extensions: `ts`, `js`, `json`
- Verbose logging enabled
- Auto-restart on changes

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill processes on ports
   npx kill-port 3000 4200
   ```

2. **TypeScript errors**:
   ```bash
   # Clean and rebuild
   npm run clean
   npm run build
   ```

3. **Module not found**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

4. **Angular CLI not found**:
   ```bash
   # Install Angular CLI globally
   npm install -g @angular/cli
   ```

### Performance Tips

- Use `npm run watch` for development (better than `npm run dev`)
- Close unnecessary browser tabs to reduce memory usage
- Use `--verbose` flag for detailed logging when debugging

## 🎯 Best Practices

1. **Use watch mode** for active development
2. **Monitor console** for compilation errors
3. **Use browser dev tools** for frontend debugging
4. **Check backend logs** for API issues
5. **Test API endpoints** with tools like Postman

---

**Quick Commands:**
```bash
npm run watch        # 🔄 Start watch mode
npm run clean        # 🧹 Clean build files  
npm run build        # 🏗️ Production build
npm run test:watch   # 🧪 Test in watch mode
```