# 🚀 Installation & Setup Guide

## Prerequisites

- **Node.js**: v14+ (recommended v18+)
- **npm**: v6+ (comes with Node.js)
- **Git**: For version control

## Step 1: Install Dependencies

Open terminal in project directory and run:

```bash
npm install
```

This will install:
- Vue 3 and Vue Router
- AWS Amplify (for cloud saves)
- Bootstrap 5
- Build tools (Babel, Webpack, Terser)
- Optimization plugins

**Expected time**: 2-3 minutes

## Step 2: Verify Installation

Check if everything installed correctly:

```bash
npm list --depth=0
```

You should see all dependencies listed without errors.

## Step 3: Run Development Server

```bash
npm run serve
```

This will:
1. Compile your code
2. Start development server
3. Open browser at http://localhost:8080
4. Enable hot-reload (changes update automatically)

**Expected output**:
```
  App running at:
  - Local:   http://localhost:8080/
  - Network: http://192.168.x.x:8080/
```

## Step 4: Test the Game

1. Open http://localhost:8080 in your browser
2. Navigate through different routes
3. Check console for errors (F12 → Console)
4. Play the game to verify functionality

## Step 5: Build for Production

When ready to deploy:

```bash
npm run build
```

This creates optimized files in `dist/` folder:
- Minified JavaScript
- Compressed CSS
- Optimized assets
- Code-split chunks

**Expected time**: 30-60 seconds

## Step 6: Deploy (Optional)

Deploy to GitHub Pages:

```bash
npm run deploy
```

This will:
1. Build production version
2. Push to `gh-pages` branch
3. Deploy to GitHub Pages

Your site will be live at: `https://YooAr1n.github.io/yooa-com`

## Troubleshooting

### Issue: `npm install` fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2**: Delete node_modules and reinstall
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue: Port 8080 already in use

**Solution**: Use different port
```bash
npm run serve -- --port 8081
```

### Issue: Build fails with memory error

**Solution**: Increase Node memory
```bash
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Issue: Hot-reload not working

**Solution**: Check firewall settings or use polling
```bash
npm run serve -- --poll
```

## Verification Checklist

After installation, verify:

- [ ] `npm install` completed without errors
- [ ] `npm run serve` starts development server
- [ ] Game loads at http://localhost:8080
- [ ] No console errors (F12 → Console)
- [ ] Routes work (navigate between pages)
- [ ] Game mechanics function correctly
- [ ] `npm run build` creates dist/ folder
- [ ] Production build works when served

## Performance Check

After installation, check performance:

```bash
# Build and analyze
npm run build:report
```

This opens a visual report showing:
- Bundle sizes
- Chunk composition
- Optimization opportunities

## Next Steps

1. **Read Documentation**
   - [QUICK_START.md](QUICK_START.md) - Quick reference
   - [OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md) - Full details
   - [PERFORMANCE_TIPS.md](PERFORMANCE_TIPS.md) - Best practices

2. **Test Performance**
   - Open Chrome DevTools (F12)
   - Go to Lighthouse tab
   - Run performance audit
   - Target: 90+ score

3. **Monitor in Console**
   ```javascript
   // Check cache
   yooaCache.entries.size
   
   // View performance

   ```

4. **Start Developing**
   - Make changes to code
   - See updates instantly (hot-reload)
   - Test in browser
   - Build for production when ready

## Useful Commands

```bash
# Development
npm run serve              # Start dev server
npm run serve -- --port 3000  # Use custom port

# Production
npm run build              # Build for production
npm run build --modern     # Modern build (fastest)
npm run build:report       # Analyze bundle

# Deployment
npm run deploy             # Deploy to GitHub Pages

# Maintenance
npm run lint               # Check code quality
npm install                # Update dependencies
```

## Environment Variables

Create `.env.local` for local development:

```env
VUE_APP_TITLE=YooA Incremental Dev
NODE_ENV=development
```

Production uses `.env.production` (already created).

## IDE Setup (Optional)

### VS Code Extensions
- Vetur or Volar (Vue support)
- ESLint (code quality)
- Prettier (code formatting)

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## System Requirements

### Minimum
- CPU: Dual-core 2GHz
- RAM: 4GB
- Disk: 500MB free space
- Browser: Chrome 90+, Firefox 88+, Safari 14+

### Recommended
- CPU: Quad-core 3GHz+
- RAM: 8GB+
- Disk: 1GB free space
- Browser: Latest Chrome/Firefox/Safari

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review error messages carefully
3. Check Node.js and npm versions
4. Verify all dependencies installed
5. Try clean install (delete node_modules)

## Success! 🎉

If you see the game running at http://localhost:8080, you're all set!

Your YooA Incremental game is now:
- ⚡ Installed and running
- 🚀 Optimized for performance
- 📦 Ready for development
- 🎮 Ready to play!

---

**Happy coding!** 💜✨
