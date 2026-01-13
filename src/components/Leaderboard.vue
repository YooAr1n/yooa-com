<template>
  <div class="leaderboard-card" v-bind="$attrs">
    <!-- decorative floating sakura petals (aria-hidden) -->
    <div class="sakura-wrap" aria-hidden="true">
      <span class="petal p1">🌸</span>
      <span class="petal p2">🌸</span>
      <span class="petal p3">🌸</span>
      <span class="petal p4">🌸</span>
      <span class="petal p5">🌸</span>
      <span class="petal p6">🌸</span>
    </div>

    <div class="leaderboard">
      <div class="header-row">
        <h1 class="title">🌸 YooA's Miracle Leaderboard — Top {{ formatWholeNum(limit) }} 🌸</h1>

        <div class="controls">
          <button class="btn" @click="refresh" :disabled="loading || !isSignedIn">Refresh</button>
          <div v-if="myRank !== null" class="my-rank">
            🌟 YooA greets you — Your rank: <strong>{{ formatWholeNum(myRank.rank) }}</strong> • YooA Points:
            <span class="mono">{{ formatPoints(myRank.YooAPoints) }}</span>
          </div>
        </div>
      </div>

      <!-- Signed-out notice -->
      <div v-if="!isSignedIn && !loading" class="signin-note">
        <p class="yooa-note">🌸 Oops! YooA says... "Please sign in to view the leaderboard — sign in to see
          your rank and compete with other Miracles! 🔑✨"</p>
        <button class="sign-btn" @click="goToSignIn">Sign In</button>
      </div>

      <div v-else-if="loading" class="loading">Loading…</div>

      <!-- Show leaderboard only when signed in -->
      <table v-else class="lb-table" role="table" aria-label="YooA leaderboard">
        <thead>
          <tr>
            <th class="col-rank">Rank</th>
            <th class="col-player">Player</th>
            <th class="col-points">YooA Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in players" :key="p.userId || i"
            :class="['player-row', { me: p.userId === currentUserId, 'rank-1': i === 0, 'rank-2': i === 1, 'rank-3': i === 2 }]"
            :style="{ animationDelay: (i * 80) + 'ms' }">
            <td class="col-rank">
              <div class="rank-badge" :aria-label="`Rank ${formatWholeNum(i + 1)}`">
                <template v-if="i === 0">👑 <span class="rank-num">{{formatWholeNum(1)}}</span></template>
                <template v-else-if="i === 1">🥈 <span class="rank-num">{{formatWholeNum(2)}}</span></template>
                <template v-else-if="i === 2">🥉 <span class="rank-num">{{formatWholeNum(3)}}</span></template>
                <template v-else>{{ formatWholeNum(i + 1) }}</template>
              </div>
            </td>

            <!-- combined avatar + name column -->
            <td class="col-player">
              <div class="player-cell">
                <!-- avatar-wrap enforces perfect circular crop and overflow:hidden -->
                <div class="avatar-wrap">
                  <!-- Avatar image -->
                  <template v-if="p.avatarUrl">
                    <img
                      :src="p.avatarUrl"
                      :alt="p.displayName || p.userId || 'avatar'"
                      class="avatar-img"
                    />
                  </template>

                  <!-- Initials fallback (like Options.vue) -->
                  <template v-else>
                    <span class="avatar-initials">
                      {{ getInitials(p.displayName || p.userId) }}
                    </span>
                  </template>
                </div>
                <div class="player-info">
                  <div class="player-name">{{ p.displayName || p.userId || 'Unknown' }}</div>
                  <div class="player-meta" v-if="p.userId === currentUserId">🌈 It's you! YooA high-five ✨</div>
                </div>
              </div>
            </td>

            <td class="col-points mono">{{ formatPoints(p.YooAPoints) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!players.length && !loading && isSignedIn" class="empty-note">
        🌸 YooA says: "There are no players yet — be the first Miracle!" 🔑✨
      </div>
    </div>
  </div>
</template>

<script>
import { Amplify, API as AmplifyAPI } from 'aws-amplify';
import awsExports from '@/aws-exports';
import { savePlayerToLeaderboardOnly } from '@/incremental/save.js';
import { getCurrentUser } from '@aws-amplify/auth';
import { getUrl } from 'aws-amplify/storage';

const API = AmplifyAPI;
Amplify.configure(awsExports);

export default {
  name: 'Leaderboard',
  data() {
    return {
      players: [],
      myRank: null,
      currentUserId: null,
      loading: false,
      limit: 100,
      placeholder: '/assets/avatar-placeholder.png'
    };
  },

  computed: {
    isSignedIn() {
      return !!this.currentUserId;
    }
  },

  async mounted() {
    try {
      const user = await getCurrentUser().catch(() => null);
      this.currentUserId = user?.attributes?.sub || user?.username || null;
    } catch (e) {
      console.warn('Leaderboard: no auth or getCurrentUser failed', e);
      this.currentUserId = null;
    }

    if (this.isSignedIn) await this.refresh();
  },

  methods: {
    // Leaderboard: methods
    async goToSignIn() {
      player.tab = "Options"
      player.subtabs.Options = "auth"
    },

    formatPoints(value) {
      return format(value);
    },

    formatWholeNum(num) {
      return formatWhole(num);
    },

    getInitials(name) {
      if (!name) return 'Y'; // YooA default ✨
      const parts = String(name).split(/[\s.@_-]+/).filter(Boolean);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    },

    async resolveAvatarUrl(avatarKey) {
      if (!avatarKey) return null;
      if (typeof avatarKey === 'string' && /^https?:\/\//i.test(avatarKey)) return avatarKey;
      try {
        const signed = await getUrl({ key: avatarKey, options: { accessLevel: 'guest' } }).catch(async () => {
          try { return await getUrl({ key: avatarKey, level: 'guest' }); } catch (e) { return null; }
        });
        if (!signed) return null;
        if (typeof signed === 'string') return signed;
        if (signed.url) return typeof signed.url === 'string' ? signed.url : signed.url.toString();
        if (signed.result && signed.result.url) return typeof signed.result.url === 'string' ? signed.result.url : signed.result.url.toString();
      } catch (e) {
        console.warn('resolveAvatarUrl failed for key', avatarKey, e);
      }
      return null;
    },

    async refresh() {
      if (!this.isSignedIn) return;
      this.loading = true;
      try {
        await savePlayerToLeaderboardOnly()
        let res = null;
        if (API && typeof API.get === 'function') {
          try {
            res = await API.get('YooAIncrementalAPI', '/leaderboard/top', {
              queryStringParameters: { limit: String(this.limit) }
            });
          } catch (e) {
            console.warn('Amplify API.get failed; falling back to fetch', e);
            res = null;
          }
        }

        if (!res) {
          let base = (awsExports?.aws_cloud_logic_custom && Array.isArray(awsExports.aws_cloud_logic_custom))
            ? (awsExports.aws_cloud_logic_custom.find(x => x && (x.name === 'YooAIncrementalAPI' || x.apiName === 'YooAIncrementalAPI'))?.endpoint)
            : null;
          if (!base) {
            base = 'https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev';
          }
          const url = `${base.replace(/\/$/, '')}/leaderboard/top?limit=${encodeURIComponent(String(this.limit))}`;
          const r = await fetch(url);
          if (!r.ok) throw new Error(`Leaderboard fetch failed ${r.status}`);
          res = await r.json();
        }

        const itemsRaw = (res && (res.items || res.body?.items)) ? (res.items || res.body.items) : [];
        const items = itemsRaw.map(it => ({
          userId: it.userId,
          displayName: it.displayName,
          avatarKey: it.avatarKey,
          YooAPoints: it.scoreRaw ?? it.YooAPoints ?? it.score ?? '0'
        }));

        await Promise.all(items.map(async it => {
          if (it.avatarKey) {
            try {
              const url = await this.resolveAvatarUrl(it.avatarKey);
              it.avatarUrl = url;
            } catch (e) {
              it.avatarUrl = null;
            }
          } else {
            it.avatarUrl = null;
          }
        }));

        this.players = items;

        if (this.currentUserId) {
          const localIdx = this.players.findIndex(p => p.userId === this.currentUserId);
          if (localIdx !== -1) {
            this.myRank = { rank: localIdx + 1, YooAPoints: this.players[localIdx].YooAPoints };
          } else {
            try {
              let parsed = null;
              try {
                const lb = await import('@/incremental/leaderboard.js').then(m => m.default).catch(() => null);
                if (lb && typeof lb.getUserRank === 'function') {
                  const r = await lb.getUserRank(this.currentUserId);
                  if (r && typeof r === 'object' && r.body) {
                    if (typeof r.body === 'string') {
                      try { parsed = JSON.parse(r.body); } catch (e) { parsed = null; }
                    } else parsed = r.body;
                  } else parsed = r;
                }
              } catch (e) {
                console.warn('leaderboard import/getUserRank failed:', e);
                parsed = null;
              }
              if (!parsed) {
                const base = (awsExports?.aws_cloud_logic_custom && Array.isArray(awsExports.aws_cloud_logic_custom))
                  ? (awsExports.aws_cloud_logic_custom.find(x => x && (x.name === 'YooAIncrementalAPI' || x.apiName === 'YooAIncrementalAPI'))?.endpoint)
                  : 'https://z4frjlkbjb.execute-api.us-east-1.amazonaws.com/dev';
                const url = `${base.replace(/\/$/, '')}/leaderboard/rank?userId=${encodeURIComponent(String(this.currentUserId))}`;
                const r = await fetch(url);
                let rr = null;
                try { rr = await r.json(); } catch (e) { rr = null; }
                if (rr && typeof rr === 'object' && rr.body) {
                  if (typeof rr.body === 'string') {
                    try { parsed = JSON.parse(rr.body); } catch (e) { parsed = null; }
                  } else parsed = rr.body;
                } else parsed = rr;
              }
              if (parsed && (parsed.rank !== undefined || parsed.YooAPoints !== undefined || parsed.ok)) {
                const rawRank = parsed.rank ?? null;
                const numericRank = (rawRank === null || rawRank === undefined) ? null : Number(rawRank);
                const finalRank = (numericRank !== null && !Number.isNaN(numericRank)) ? numericRank : (rawRank === null ? null : rawRank);
                this.myRank = {
                  rank: finalRank,
                  YooAPoints: parsed.YooAPoints ?? parsed.YooAPoints ?? null
                };
              } else {
                this.myRank = null;
              }
            } catch (e) {
              console.error('Failed to fetch/parse /leaderboard/rank', e);
              this.myRank = null;
            }
          }
        } else {
          this.myRank = null;
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        this.players = [];
        this.myRank = null;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Layout helpers & sidebar-safe defaults */
.leaderboard-card {
  --yooa-pink: #ffb6e6;
  --yooa-deep: #7a4a9e;
  --yooa-gold: linear-gradient(90deg, #ffd86b, #ff9b6b);

  /* If your app exposes a CSS var for sidebar width use that; otherwise fallback */
  --app-sidebar-width: var(--app-sidebar-width, 260px);

  /* Reserve horizontal space so a fixed/absolute left sidebar does NOT overlap content */
  margin-left: var(--app-sidebar-width);
  max-width: calc(100% - var(--app-sidebar-width));
  transition: margin-left .18s ease, max-width .18s ease;

  position: relative;
  /* for sakura absolute children */
  padding: 18px;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(122, 74, 158, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 250, 255, 0.98));
  overflow: hidden !important;
  box-sizing: border-box;
  z-index: 0;
}

/* On narrow screens we usually want the sidebar hidden or overlaid — remove left offset */
@media (max-width: 900px) {
  .leaderboard-card {
    margin-left: 0;
    max-width: 100%;
  }
}

/* sakura petals container */
.sakura-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 99;
  overflow: hidden;
  display: block;
  mix-blend-mode: normal;
}

/* basic petal styling and individual starting positions */
.petal {
  position: absolute;
  top: -6%;
  font-size: 20px;
  opacity: 0.95;
  transform-origin: center;
  will-change: transform, opacity;
  z-index: 99;
  /* ensure petal is in front of almost everything */
  pointer-events: none;
  /* double safety: no interaction */
  filter: drop-shadow(0 6px 10px rgba(122, 74, 158, 0.06));
}

/* each petal has a different horizontal start, size, duration & delay */
.p1 {
  left: 6%;
  animation: petal-fall 7.2s linear infinite;
  font-size: 22px;
  animation-delay: 0s;
}

.p2 {
  left: 28%;
  animation: petal-fall 9.1s linear infinite;
  font-size: 18px;
  animation-delay: 1.2s;
}

.p3 {
  left: 52%;
  animation: petal-fall 8.0s linear infinite;
  font-size: 20px;
  animation-delay: .6s;
}

.p4 {
  left: 74%;
  animation: petal-fall 10.5s linear infinite;
  font-size: 16px;
  animation-delay: 2.4s;
}

.p5 {
  left: 85%;
  animation: petal-fall 8.8s linear infinite;
  font-size: 19px;
  animation-delay: 0.9s;
}

.p6 {
  left: 40%;
  animation: petal-fall 11.2s linear infinite;
  font-size: 17px;
  animation-delay: 1.8s;
}

/* header shimmer */
.header-row .title {
  position: relative;
  overflow: hidden;
  z-index: 12;
  /* above petals */
}

.header-row .title::after {
  content: "";
  position: absolute;
  left: -40%;
  top: 0;
  bottom: 0;
  width: 40%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  transform: skewX(-20deg);
  animation: shimmer 3.8s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: .9;
}

/* header shimmer keyframes */
@keyframes shimmer {
  0% {
    left: -40%;
  }

  50% {
    left: 120%;
  }

  100% {
    left: -40%;
  }
}

/* petal fall animation */
@keyframes petal-fall {
  0% {
    transform: translateY(-8vh) rotate(0deg) scale(1);
    opacity: 0.95;
  }

  10% {
    opacity: 0.98;
  }

  50% {
    transform: translateY(45vh) rotate(180deg) scale(1.05);
    opacity: 0.85;
  }

  80% {
    transform: translateY(90vh) rotate(300deg) scale(0.95);
    opacity: 0.6;
  }

  100% {
    transform: translateY(110vh) rotate(420deg) scale(0.9);
    opacity: 0;
  }
}

/* header layout */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  z-index: 12;
  /* above petals */
  position: relative;
}

.title {
  font-size: 1.15rem;
  margin: 0;
  color: var(--yooa-deep);
  font-weight: 700;
}

/* controls */
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 12;
}

.btn {
  background: var(--yooa-pink);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.my-rank {
  font-weight: 600;
  color: var(--yooa-deep);
}

.mono {
  color: var(--yooa-deep);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono", monospace;
}

/* signed-in / signed-out notes sit above petals */
.signin-note {
  background: linear-gradient(90deg, rgba(255, 243, 250, 1), rgba(255, 250, 245, 1));
  border: 1px solid rgba(255, 182, 230, 0.6);
  padding: 12px;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  z-index: 12;
}

.yooa-note {
  margin: 0;
  font-weight: 700;
  color: var(--yooa-deep);
}

.sign-btn {
  background: var(--yooa-pink);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

/* leaderboard table container raised above petals */
.lb-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  z-index: 12;
  /* ensure table rows sit above petals and potential overlays */
  position: relative;
  background: transparent;
}

/* table typography */
.lb-table thead th {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-weight: 700;
  color: var(--yooa-deep);
}

.lb-table tbody td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  vertical-align: middle;
}

/* columns */
.col-rank {
  width: 76px;
  text-align: left;
}

.col-player {
  width: 1fr;
}

.col-points {
  width: 220px;
  text-align: left;
}

/* player cell */
.player-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ---------------- FIXED AVATAR RULES (full block) ---------------- */
.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 900;
  font-size: 32px;
  letter-spacing: 0.02em;

  color: #7a4a9e;
  background: linear-gradient(
    135deg,
    rgba(255,182,230,0.85),
    rgba(255,220,245,0.95)
  );

  user-select: none;
}

.leaderboard-card .avatar-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50% !important;
  overflow: hidden !important;
  flex: 0 0 56px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 6px 18px rgba(122, 74, 158, 0.08);
  transition: transform .28s ease, box-shadow .28s ease;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 250, 255, 0.5));
  box-sizing: border-box;
  line-height: 0;
  -webkit-mask-image: radial-gradient(circle, black 60%, transparent 100%);
  mask-image: radial-gradient(circle, black 60%, transparent 100%);
  z-index: 13;
  /* avatar sits above petals */
}

/* force the image to fill the wrapper and be circular */
.leaderboard-card .avatar-wrap .avatar-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 50% !important;
  -webkit-border-radius: 50% !important;
  box-sizing: border-box !important;
  border: 0 !important;
  vertical-align: middle !important;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* ensure rank sizes also remain perfectly circular and scale both wrapper + image */
.player-row.rank-1 .avatar-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50% !important;
  flex: 0 0 72px !important;
}

.player-row.rank-1 .avatar-wrap .avatar-img {
  width: 100% !important;
  height: 100% !important;
}

.player-row.rank-2 .avatar-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50% !important;
  flex: 0 0 64px !important;
}

.player-row.rank-2 .avatar-wrap .avatar-img {
  width: 100% !important;
  height: 100% !important;
}

.player-row.rank-3 .avatar-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50% !important;
  flex: 0 0 60px !important;
}

.player-row.rank-3 .avatar-wrap .avatar-img {
  width: 100% !important;
  height: 100% !important;
}

/* keep hover micro-interaction circular */
.player-row:hover .avatar-wrap {
  transform: translateY(-6px) scale(1.04);
  border-radius: 50% !important;
}

/* player info */
.player-info .player-name {
  font-weight: 700;
  color: var(--yooa-deep);
}

.player-meta {
  font-size: 0.85rem;
  color: #a081c7;
}

/* highlight current user row */
tr.me {
  background: linear-gradient(90deg, rgba(255, 245, 238, 0.6), rgba(255, 250, 255, 0.5));
  transform: translateZ(0);
  z-index: 12;
}

/* Rank badges */
.rank-badge {
  color: var(--yooa-deep);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  z-index: 12;
}

.rank-num {
  margin-left: 6px;
  font-weight: 900;
}

/* Top ranks special styles */
.player-row.rank-1 {
  background: linear-gradient(90deg, rgba(255, 250, 240, 0.9), rgba(255, 245, 230, 0.9));
  box-shadow: 0 12px 34px rgba(255, 165, 50, 0.10);
  border-radius: 10px;
  transform: translateY(-4px);
  z-index: 12;
}

.player-row.rank-1 .avatar-wrap {
  border: 3px solid rgba(255, 225, 150, 0.85);
  animation: gentle-glow-wrap 2.8s ease-in-out infinite;
}

.player-row.rank-1 .rank-badge {
  background: linear-gradient(90deg, #ffd86b, #ff9b6b);
  color: #5a2b04;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 8px 22px rgba(255, 155, 60, 0.12);
  transform-origin: center left;
  animation: ribbon-sway 3s ease-in-out infinite;
}

/* silver for #2 */
.player-row.rank-2 {
  background: linear-gradient(90deg, rgba(245, 249, 255, 0.9), rgba(245, 247, 252, 0.9));
  border-radius: 8px;
  transform: translateY(-2px);
  z-index: 12;
}

.player-row.rank-2 .avatar-wrap {
  border: 2px solid rgba(220, 230, 245, 0.9);
}

.player-row.rank-2 .rank-badge {
  background: linear-gradient(90deg, #dddddd, #c7c7c7);
  color: #797979;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 8px 22px rgba(255, 155, 60, 0.12);
  transform-origin: center left;
  animation: ribbon-sway 3s ease-in-out infinite;
}

/* bronze for #3 */
.player-row.rank-3 {
  background: linear-gradient(90deg, rgba(255, 250, 246, 0.95), rgba(255, 247, 242, 0.95));
  border-radius: 6px;
  z-index: 12;
}

.player-row.rank-3 .avatar-wrap {
  border: 2px solid rgba(230, 200, 170, 0.95);
}

.player-row.rank-3 .rank-badge {
  background: linear-gradient(90deg, #ddb492, #b4855e);
  color: #7e5220;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 8px 22px rgba(255, 155, 60, 0.12);
  transform-origin: center left;
  animation: ribbon-sway 3s ease-in-out infinite;
}

/* row hover & micro-interaction */
.player-row:hover {
  transform: translateY(-6px);
  transition: transform .18s ease, box-shadow .18s ease;
}

/* row entrance animation (staggered via inline style animationDelay) */
.player-row {
  opacity: 0;
  transform: translateY(8px);
  animation: row-in .42s cubic-bezier(.2, .9, .3, 1) forwards;
}

/* small glow wrapper animation for rank-1 */
@keyframes gentle-glow-wrap {
  0% {
    box-shadow: 0 10px 24px rgba(255, 170, 50, 0.06);
    transform: scale(1.00);
  }

  50% {
    box-shadow: 0 28px 58px rgba(255, 170, 50, 0.14);
    transform: scale(1.02);
  }

  100% {
    box-shadow: 0 10px 24px rgba(255, 170, 50, 0.06);
    transform: scale(1.00);
  }
}

@keyframes row-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(.998);
  }

  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.003);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ribbon sway */
@keyframes ribbon-sway {
  0% {
    transform: translateX(0) rotate(-2deg);
  }

  50% {
    transform: translateX(6px) rotate(2deg);
  }

  100% {
    transform: translateX(0) rotate(-2deg);
  }
}

/* small helpers */
.loading {
  padding: 12px;
  color: var(--yooa-deep);
  z-index: 12;
}

.empty-note {
  margin-top: 12px;
  color: #8a5fb3;
  font-weight: 700;
  z-index: 12;
}
</style>