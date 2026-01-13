// leaderboard.js — robust v6-friendly, falls back to fetch if Amplify.API missing
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { API } from 'aws-amplify'; // may be undefined in some bundling environments
import awsExports from '@/aws-exports';

/**
 * Resolve the API base URL for an Amplify API name by inspecting aws-exports.
 * Returns null if not found.
 */
function getApiBaseUrlFromExports(apiName = 'YooAIncrementalAPI') {
  try {
    // Amplify classic export shape: aws_cloud_logic_custom is an array of { name, endpoint }
    const cloudLogic = awsExports?.aws_cloud_logic_custom;
    if (Array.isArray(cloudLogic)) {
      const found = cloudLogic.find(e => e && (e.name === apiName || e.apiName === apiName));
      if (found) return found.endpoint || found.url || null;
    }
    // Amplify newer shape: API endpoints may live under aws_exports.API or similar
    const endpoints = awsExports?.API?.endpoints || awsExports?.api?.endpoints;
    if (Array.isArray(endpoints)) {
      const found = endpoints.find(e => e && (e.name === apiName || e.apiName === apiName));
      if (found) return found.endpoint || found.url || null;
    }
  } catch (e) {
    // ignore
  }
  // final fallback: known default from your Options.vue earlier
  return 'https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev';
}

/**
 * Helper to perform POST either via Amplify.API or fetch fallback.
 */
async function postToApi(path, body, idToken = null) {
  // If Amplify API is available and has a post method, use it.
  if (API && typeof API.post === 'function') {
    try {
      return await API.post('YooAIncrementalAPI', path, {
        body,
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
      });
    } catch (e) {
      // fall through to fetch fallback if Amplify API.post fails for any reason
      console.warn('Amplify API.post failed, falling back to fetch():', e);
    }
  }

  // fetch fallback
  const base = getApiBaseUrlFromExports('YooAIncrementalAPI') || 'https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev';
  // Ensure base doesn't end with slash, path does start with '/'
  const url = (base.endsWith('/') ? base.slice(0, -1) : base) + (path.startsWith('/') ? path : '/' + path);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch POST ${res.status} ${res.statusText} ${text}`);
  }
  // try to parse JSON, but don't assume it's always JSON
  try { return await res.json(); } catch (e) { return null; }
}

class LeaderboardService {
  /**
   * Save player data to leaderboard.
   * - YooAPoints: Decimal-like or number
   * - meta: optional object { displayName?: string|null, avatarKey?: string|null, avatarUrl?: string|null }
   * - slot: optional slot string (default "main")
   */
  async savePlayerData(YooAPoints, meta = {}, slot = "main") {
    try {
      // Try to get the current user (v6 helper)
      let user = null;
      try {
        user = await getCurrentUser().catch(() => null);
      } catch (e) {
        user = null;
      }

      if (!user) {
        console.warn("savePlayerData: no authenticated user");
        return false;
      }

      // Try to get ID token via fetchAuthSession (v6)
      let idToken = null;
      try {
        const session = await fetchAuthSession();
        idToken = session?.tokens?.idToken?.toString?.() || session?.tokens?.idToken?.jwtToken || null;
      } catch (e) {
        idToken = user?.signInUserSession?.idToken?.jwtToken ?? null;
      }

      // Build payload
      const payload = {
        slot,
        scoreRaw: String(YooAPoints ?? 0)
      };

      // Normalize meta param
      let actualDisplayName = null;
      let actualAvatarKeyOrUrl = undefined; // undefined = unknown, null = explicitly empty

      if (meta && typeof meta === 'object') {
        if (typeof meta.displayName === 'string' && meta.displayName.trim() !== '') actualDisplayName = meta.displayName;
        if (typeof meta.avatarKey === 'string' && meta.avatarKey.trim() !== '') actualAvatarKeyOrUrl = meta.avatarKey;
        else if (typeof meta.avatarUrl === 'string' && meta.avatarUrl.trim() !== '') actualAvatarKeyOrUrl = meta.avatarUrl;
      }

      // If anything is missing, try to read Cognito attributes
      if (!actualDisplayName || typeof actualAvatarKeyOrUrl === 'undefined') {
        try {
          const attrsRaw = await fetchUserAttributes().catch(() => null);
          const attrsMap = {};
          if (Array.isArray(attrsRaw)) {
            attrsRaw.forEach(a => {
              const name = a.Name || a.name;
              const value = a.Value || a.value;
              if (name) attrsMap[name] = value;
            });
          } else if (attrsRaw && typeof attrsRaw === 'object') {
            Object.assign(attrsMap, attrsRaw);
          }

          if (!actualDisplayName) actualDisplayName = attrsMap['custom:displayName'] || attrsMap['name'] || attrsMap['email'] || user?.username || null;
          if (typeof actualAvatarKeyOrUrl === 'undefined') {
            const pic = attrsMap['custom:picture'] || attrsMap['picture'] || null;
            if (pic) actualAvatarKeyOrUrl = pic;
          }
        } catch (e) {
          console.warn('savePlayerData: fetchUserAttributes failed', e);
        }
      }

      if (actualDisplayName) payload.displayName = String(actualDisplayName);
      if (actualAvatarKeyOrUrl) payload.avatarKey = String(actualAvatarKeyOrUrl);

      // Post to API (using either Amplify API or fetch fallback)
      const res = await postToApi('/leaderboard/update', payload, idToken);

      console.log("leaderboard update response:", res);
      return true;
    } catch (error) {
      console.error('Failed to save to leaderboard:', error);
      return false;
    }
  }

  async getTopPlayers(limit = 100) {
    try {
      // prefer Amplify API.get if present
      if (API && typeof API.get === 'function') {
        const response = await API.get('YooAIncrementalAPI', '/leaderboard/top', {
          queryStringParameters: { limit: String(limit) }
        });
        return (response && response.items) ? response.items : [];
      } else {
        // fallback fetch
        const base = getApiBaseUrlFromExports('YooAIncrementalAPI');
        const url = (base.endsWith('/') ? base.slice(0, -1) : base) + '/leaderboard/top?limit=' + encodeURIComponent(String(limit));
        const r = await fetch(url);
        if (!r.ok) throw new Error('GET failed ' + r.status);
        const data = await r.json();
        return (data && data.items) ? data.items : [];
      }
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId = null) {
    try {
      if (!userId) {
        let user = null;
        try {
          user = await getCurrentUser().catch(() => null);
        } catch (e) {
          user = null;
        }
        userId = user?.attributes?.sub || user?.username;
      }
      if (!userId) return null;

      if (API && typeof API.get === 'function') {
        const response = await API.get('YooAIncrementalAPI', '/leaderboard/rank', {
          queryStringParameters: { userId }
        });
        return response;
      } else {
        const base = getApiBaseUrlFromExports('YooAIncrementalAPI');
        const url = (base.endsWith('/') ? base.slice(0, -1) : base) + '/leaderboard/rank?userId=' + encodeURIComponent(String(userId));
        const r = await fetch(url);
        if (!r.ok) throw new Error('GET failed ' + r.status);
        return await r.json();
      }
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return null;
    }
  }
}

export default new LeaderboardService();
