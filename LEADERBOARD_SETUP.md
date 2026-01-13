# Deploy AWS Leaderboard

## 1. Deploy Backend
```bash
cd "d:\YooA\YooA HTML\yooa-com"
amplify push
```

## 2. Test Endpoints
After deployment, test in browser console:
```javascript
// Save test data
API.post('YooAIncrementalAPI', '/save', {
  body: { userId: 'test123', displayName: 'TestPlayer', YooAPoints: 1000000 }
});

// Get leaderboard
API.get('YooAIncrementalAPI', '/leaderboard/top', {
  queryStringParameters: { limit: '10' }
});

// Get rank
API.get('YooAIncrementalAPI', '/leaderboard/rank', {
  queryStringParameters: { userId: 'test123' }
});
```

## 3. Frontend Integration
The leaderboard automatically saves when you save your game. Manual usage:
```javascript
import leaderboard from '@/incremental/leaderboard.js';

// Save current progress
await leaderboard.savePlayerData(player.YooAPoints, 'MyName');

// Get top 50 players
const top = await leaderboard.getTopPlayers(50);

// Get my rank
const rank = await leaderboard.getUserRank();
```

## Architecture
- **DynamoDB**: Stores player data (userId, displayName, YooAPoints, avatarKey)
- **Lambda**: Handles save/retrieve operations with CORS
- **S3**: Stores avatar images (already configured)
- **Cognito**: User authentication (already configured)
- **Auto-save**: Triggers on every game save when YooAPoints > 0