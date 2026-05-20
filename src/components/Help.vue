<template>
  <section class="help-panel" role="region" aria-label="YooA Help">
    <header class="help-header">
      <h2>🌸 YooA Incremental — Help</h2>
      <p class="subtitle">Pick a topic to learn how the magic works ✨</p>
    </header>

    <nav class="tabs" role="tablist" aria-label="Help subtabs">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: currentTab === tab.key }]" role="tab"
        :aria-selected="currentTab === tab.key" :aria-controls="`help-${tab.key}`" @click="changeTab(tab.key)">
        {{ tab.label }}
      </button>

      <div class="spacer" />
      <button class="advanced-btn" @click="openAdvanced" title="Open advanced help">
        Advanced ➜
      </button>
    </nav>

    <main class="tab-content" role="tabpanel">
      <transition name="fade" mode="out-in">
        <div :key="currentTab" class="content-wrap">

          <!-- YOOA TAB -->
          <article v-if="currentTab === 'YooA'" :id="'help-YooA'" class="help-section">
            <h3>🌸 YooA — Beginner's Bloom</h3>
            <p class="lead">
              <strong>YooA Incremental</strong> is a cozy numbers game where math problems grow your wealth — and your
              love for OH MY GIRL.
              Solve addition & subtraction problems to earn <strong>YooA Points</strong>, then spend points on upgrades
              and dimensions to make your numbers sing.
            </p>

            <h4>How the Main Layer works</h4>
            <ul>
              <li><strong>Math Problems</strong> — Solve addition and subtraction problems to collect YooA Points. Speed
                and accuracy matter!</li>
              <li><strong>Upgrades</strong> — Spend YooA Points to buy upgrades that improve earning rates and unlock
                new mechanics.</li>
              <li><strong>Dimensions</strong> — Special units that produce resources and boost YooA Point production.
                Buy wisely to scale faster.</li>
            </ul>

            <h4>YooA Dimensions (tiers)</h4>
            <p>There are five Dimension tiers. Each tier produces the one below it, creating a chain of steady,
              compounding production:</p>
            <ol class="tiers">
              <li><strong>Lines</strong> — Directly boost YooA Point gain.</li>
              <li><strong>Planes</strong> — Produce Lines over time.</li>
              <li><strong>Spaces</strong> — Produce Planes (unlocks later).</li>
              <li><strong>Realms</strong> — Produce Spaces.</li>
              <li><strong>Entities</strong> — Produce Realms.</li>
            </ol>
            <p class="note">Tiers 3+ unlock later and cost <strong>YooAmatter</strong> instead of YooA Points.</p>

            <h4>UI bits explained</h4>
            <dl>
              <dt><strong>Dimension Multiplier</strong></dt>
              <dd>
                Shown as a multiplier (e.g., <em>x1.00</em>) next to the level. This multiplier multiplies that tier's
                base production.
                Each purchase raises the multiplier — and the next level costs more.
                <div class="mini">Intuition: <code>production ≈ base × multiplier × quantity</code></div>
              </dd>

              <dt><strong>Accumulated Dimension Quantity</strong></dt>
              <dd>
                The number before the name (e.g., <em>123 YooA Lines</em>) is your total amount of that dimension —
                purchased + produced by higher tiers.
                Higher tiers act like factories that add to lower tiers over time.
              </dd>

              <dt><strong>Dimension Growth Percent</strong></dt>
              <dd>
                This shows how much the dimension grows per second. <strong>(+100.00%/s)</strong> means the quantity
                doubles
                every second.
                Use it to judge whether your economy is accelerating or crawling.
              </dd>
            </dl>

            <h4>YooA Strategy Tips</h4>
            <ol class="tips">
              <li><strong>Solve fast:</strong> Quick solves give more YooA Points which accelerate early upgrades.</li>
              <li><strong>Buy multipliers early:</strong> Small multiplier bumps snowball over time.</li>
              <li><strong>Invest upward:</strong> A few higher-tier purchases (Planes/Spaces) can supercharge lower-tier
                production later.</li>
              <li><strong>Prestige timing:</strong> When YooAmatter unlocks, prestige to unlock automation (Arin) and
                further growth loops.</li>
            </ol>

            <p class="yooa-voice">🌈 YooA whisper: “Plant small upgrades early — the garden of numbers blooms best with
              gentle care.”</p>
          </article>

          <!-- YOOAMATTER TAB -->
          <article v-else-if="currentTab === 'YooAmatter'" :id="'help-YooAmatter'" class="help-section">
            <h3>✨ YooAmatter — Ascend, Automate, & Amplify</h3>
            <p class="lead">
              When your YooA Points bloom into a mountain (1.00e12), you can <strong>Ascend</strong> — reset your YooA
              layer for
              <strong>YooAmatter</strong>,
              a prestige currency that unlocks automation, new math problems, and deeper growth loops.
            </p>

            <h4>Ascension & YooAmatter</h4>
            <p>
              <strong>Ascend</strong> once you have enough YooA Points to gain YooAmatter. Ascension resets:
              <em>YooA Points, YooA Dimensions, YooA math problems, and YooA Upgrades</em>, but awards YooAmatter and
              increments your Ascension count.
              Each Ascension makes later runs more powerful and unlocks tier 3+ YooA Dimensions.
            </p>
            <p class="mini">Tip: Ascending early & often helps you reach automation and higher-tier growth much faster.
            </p>

            <h4>YooArium — a new kind of math magic</h4>
            <p>
              <strong>YooArium</strong> unlocks after buying a YooAmatter upgrade (e.g., Digit Optimizer). It's earned
              by solving multiplication/division math problems in the YooAmatter tab.
              YooArium boosts YooAmatter and YooA math gains and is spent on powerful YooArium upgrades.
            </p>

            <h4>YooAmatter Challenges</h4>
            <p>
              Challenges become available after buying certain YooAmatter upgrades (e.g., Streamliner Spark). They
              change game rules to make runs tougher but reward meaningful bonuses.
              To complete one you must hit a YooA Points goal under the modified rules.
            </p>
            <ul class="mini">
              <li>Completing a challenge grants an <strong>autobuyer</strong> (and the first completion of any challenge
                unlocks <strong>Arin</strong>).</li>
              <li>Challenges can be retried; only the first completion gives the permanent reward, but you can farm
                challenge rewards if you want the practice or shorter runs.</li>
              <li>Exit any challenge at any time with <em>Exit Challenge</em> if you change your mind.</li>
            </ul>

            <h4>Arin — your dear autobuyer friend</h4>
            <p>
              <strong>Arin</strong> automates purchases: dimensions, upgrades, and prestiges. She's unlocked through
              challenge progression and/or upgrades.
              All autobuyer controls live in the Arin tab.
            </p>

            <h5>Upgrading Arin</h5>
            <p>
              You can <strong>upgrade Arin's level using YooArium</strong>. Each Arin level both <em>boosts YooArium
                gain</em> (so you earn more of the resource that powers her)
              and <em>increases Arin's autobuyer speed</em>, letting her make purchases more often. Invest in Arin to
              turn manual grinding into elegant automation.
            </p>

            <h5>Arin Ranks & Unlock</h5>
            <p>
              <strong>Arin Rank</strong> unlocks when you buy the YooAity upgrade <em>Shi-ah's Temporal Chorus (YE
                15)</em>.
              Once unlocked, Arin Ranks <strong>boost Arin levels</strong> and <strong>increase YooA Essence
                gain</strong>.
              In short: buy YE 15 to awaken Arin's true potential — higher ranks make Arin both smarter and stronger.
            </p>

            <h5>Autobuyer basics</h5>
            <ul>
              <li><strong>Interval:</strong> How often the autobuyer attempts purchases (cooldown time).</li>
              <li><strong>Buy quantity:</strong> Choose between buying a single unit or buying max (as many as it can
                afford).</li>
              <li><strong>Targets:</strong> Configure what Arin should buy (dimensions, upgrades, or prestiges) from the
                Arin UI.</li>
            </ul>
            <p class="mini">Pro tip: tune intervals and buy-quantity so Arin doesn't waste resources on tiny gains — a
              slightly slower Arin is sometimes smarter.</p>

            <h4>YooAmatter Formations — permanent multipliers</h4>
            <p>
              Formations unlock via a YooAmatter upgrade (YooA's Genesis). They are bought with YooAmatter and grant
              permanent multipliers per purchase.
              Like YooA Dimensions, each Formation tier produces the previous tier — but only your purchased Formation
              counts across ascensions (production resets).
            </p>

            <h5>How Formations behave</h5>
            <ul>
              <li><strong>Purchasing:</strong> Formations cost YooAmatter and permanently raise multipliers that persist
                through ascensions.</li>
              <li><strong>Production:</strong> Higher Formation tiers produce the lower-tier Formation over time during
                a run (this production does NOT persist after Ascension).</li>
              <li><strong>Reset rules:</strong> At Ascension, produced Formation quantities reset to the amounts you
                purchased — your purchased multipliers remain permanent.</li>
              <li><strong>First tier (Threads):</strong> Produces <strong>YooAmatter Sparks</strong> — a resource that
                boosts YooArium gain and adds exponents to YooA Points.</li>
            </ul>

            <h4>Formation tiers</h4>
            <p><em>Threads → Weaves → Flows → Realizations → Cores</em></p>

            <h4>YooAmatter Sparks & Spark Upgrades</h4>
            <p>
              <strong>Sparks</strong> are produced by the first Formation tier and are used to buy Spark Upgrades.
              Spark Upgrades give multiplicative and sometimes exponential boosts to YooArium and YooA Point gain —
              they're a core long-term power sink.
            </p>

            <h4>Quick progression tips</h4>
            <ol class="tips">
              <li><strong>Ascend with purpose:</strong> don't ascend too early — aim for a decent YooAmatter payout so
                your next run is noticeably stronger.</li>
              <li><strong>Buy a Formation or two:</strong> Purchased formation multipliers compound across ascensions —
                they're great long-term investments.</li>
              <li><strong>Unlock Arin smartly:</strong> Upgrading Arin before automating huge buys prevents wasted
                resources and improves efficiency.</li>
              <li><strong>Try challenges:</strong> Even if they're punishing, the autobuyer and Arin unlocks often pay
                back many runs later.</li>
            </ol>

            <p class="yooa-voice">🌸 YooA whisper: “Prestige weeds out tiny gains and plants majestic forests — ascend,
              plant a Formation, and let Arin tend the orchard.”</p>
          </article>

          <article v-else-if="currentTab === 'YooAity'" :id="'help-YooAity'" class="help-section">
            <h3>🌌 YooAity — Transcendence, Echoes, and Birth</h3>
            <p class="lead">
              YooAity is the realm of Transcensions and rebirth — where YooAmatter becomes YooA Essence and whole new
              systems awaken.
              Transcend to unlock long-term progression, powerful permanent upgrades, and the story of YooA's world.
            </p>

            <h4>Transcendence & YooA Essence</h4>
            <p>
              When you reach <strong>9.17e1995 YooAmatter</strong>, you can <strong>Transcend</strong> for <strong>YooA
                Essence</strong>.
              Transcension resets most lower-layer things (YooA Points, YooA Dimensions, YooAmatter runs, etc.) but
              preserves challenge times, Achievements,
              and anything under the General stats. Your first Transcension unlocks new features and content.
            </p>
            <p class="mini">You gain more YooA Essence the more YooAmatter you had prior to transcending. Each
              Transcension adds one to your Transcension counter.</p>

            <h4>How YooA Essence works</h4>
            <p>
              YooA Essence scales similarly to YooAmatter gains but uses your YooAmatter total as the base. Spend YooA
              Essence to buy powerful permanent
              upgrades and resources that alter many systems across layers.
            </p>

            <h4>YooAity Milestones</h4>
            <p>
              As you accumulate Transcensions you unlock Milestones that make future Transcensions faster and more
              convenient.
              Milestones may:
            </p>
            <ul>
              <li>Automatically grant certain upgrades when you start a Transcension (they'll auto-purchase and max out
                for you).</li>
              <li>Give passive multipliers, autobuyers, or quality-of-life improvements.</li>
              <li>Unlock new members or mechanics tied to dates (Seunghee, Yubin, Arin, etc.).</li>
            </ul>

            <h4>Shi-ah Echoes & Embers</h4>
            <p>
              After your first Transcension you unlock <strong>Shi-ah Echoes</strong> — a new shop currency bought with
              YooA Essence.
              Echoes produce <strong>Shi-ah Embers</strong>, which boost YooA Points, YooA Dimensions, and give
              <strong>free
                YooA Challenge (YU11) Upgrades</strong>.
            </p>
            <ul>
              <li>Echoes and Embers behave like dimensions: higher tiers produce lower tiers (2 → 1), and purchased
                multipliers persist across Ascensions.</li>
              <li>Produced quantities reset to purchased amounts at each Transcension, but purchased multipliers remain
                permanent.</li>
            </ul>

            <h4>YooA's Birth, YooChronium & Aging</h4>
            <p>
              <strong>YooA's Birth</strong> happens when you buy the YooAity upgrade <em>Shi-ah's First Breath (YE
                25)</em>. YooA was born Yoo Yeon-joo
              on <strong>September 17, 1995</strong>. After birth you gain access to <strong>YooChronium</strong>, a
              resource earned by solving exponentiation math
              problems in the YooAity tab.
            </p>
            <p>
              YooChronium speeds YooA aging and boosts YooAmatter math gains. YooA ages based on Shi-ah Embers; age
              unlocks YooAity milestones and member content.
              The UI shows the in-game <em>date</em> (e.g., <strong>September 17, 1995 09:00:00</strong>) and the aging
              speed (e.g., <em>1.00 s/s</em>).
            </p>

            <h4>Members & Date-based Unlocks</h4>
            <p>
              Some new playable members unlock when the in-game date reaches their birthdates — these members grant new
              currencies and upgrades:
            </p>
            <ul>
              <li><strong>Seunghee</strong> — unlocks at <strong>Jan 25, 1996 09:00:00</strong> (YooA is 130 days old).
                Earn <em>Seunghee Points</em> which exponentiate YooA Point gain and multiply YooChronium gain. Use them
                for Seunghee upgrades.</li>
              <li><strong>Yubin</strong> — unlocks at <strong>Sept 9, 1997 09:00:00</strong> (YooA is 723 days old).
                Earn <em>Yubin Points</em> which exponentiate YooA Point gain and multiply Seunghee Point gain. Use them
                for Yubin upgrades.</li>
              <li><strong>Arin & Arinium</strong> — Arin (the autobuyer) was unlocked earlier via YooAmatter challenges;
                when the date hits <strong>Jun 18, 1999 09:00:00</strong> (YooA is 1370 days old) you unlock
                <em>Arinium</em>, a resource that boosts Arin.
              </li>
              <li><strong>Hyojung</strong> — unlocks at <strong>Jul 28, 2002 09:00:00</strong> (Hyojung's 8th Birhtday,
                YooA is 2,506 days old).
                Earn <em>Hyojung Points</em> which exponentiate YooA Point gain and multiply Arinium gain. Use them
                for Hyojung upgrades.</li>
              <li><strong>Mimi</strong> — unlocks at <strong>May 1, 2005 09:00:00</strong> (Mimi's 10th Birhtday, YooA
                is 3,514 days old).
                Earn <em>Mimi Points</em> which exponentiate YooA Point gain and multiply Hyojung Point gain. Use them
                for Mimi upgrades.</li>
            </ul>

            <h5>Arinium & Arin Ranks</h5>
            <p>
              <strong>Arinium</strong> is gained once Arin's buying speed for Arin Ranks reaches certain thresholds
              (Arinium generation starts at about 2e10 autobuys/sec).
              Arinium exponentiates YooA Point gain and multiplies Yubin point gain, and can be spent on Arinium
              upgrades in the Arin tab.
            </p>
            <p>
              <strong>Arin Rank unlock:</strong> purchasing the YooAity upgrade <em>Shi-ah's Temporal Chorus (YE
                15)</em> unlocks Arin Ranks.
              Arin Ranks boost Arin levels and <strong>increase YooA Essence gain</strong>, making automation even more
              powerful.
            </p>

            <h4>Debut & OH MY GIRL unlock</h4>
            <p>
              OH MY GIRL unlocks when the in-game date reaches the debut date <strong>April 20, 2005 09:00:00</strong>,
              and
              you must also purchase the YooAity upgrade <em>Eternal Debut (YE 55)</em> to fully awaken the group.
            </p>
            <p>
              Once unlocked you gain <strong>Miracle Light</strong> (a group currency) based on all members' Lights.
              Miracle Light provides group-wide boosts: it increases each member's Points and also raises Ascension
              gains for member layers. The OH MY GIRL tab is where you manage lights, member skills, and group upgrades.
            </p>

            <h4>Stage Skills (Vocals / Dance / Charisma)</h4>
            <p>
              Each member has three skill tracks that model their on-stage growth:
            </p>
            <ul>
              <li><strong>Vocals</strong> — unlocks immediately when the member's Light unlocks (YooA's Vocals are
                available at Debut).</li>
              <li><strong>Dance</strong> — unlocks after Vocals reaches level <strong>100</strong>.</li>
              <li><strong>Charisma</strong> — unlocks after Dance reaches level <strong>100</strong>.</li>
            </ul>

            <h5>Leveling a skill</h5>
            <p>
              To level any skill you need <strong>Sparkles</strong>. Sparkles are a small, continuously-generated
              resource tied to how much Light you've invested into that specific skill: the more Light allocated, the
              faster Sparkles generate for that skill.
            </p>

            <ul>
              <li><strong>Sparkles generation</strong> — each skill gains Sparkles per second based on the amount of
                Light currently assigned to that skill.</li>
              <li><strong>Progress bar</strong> — leveling progress is displayed with a progress bar that fills as
                Sparkles accumulate toward the next level. When full, that skill levels up.
              </li>
              <li><strong>Level caps</strong> — some skills may have soft caps where each level becomes gradually more
                expensive; later upgrades lift or soften those caps.</li>
            </ul>

            <h5>Light allocation & skill controls</h5>
            <p>
              In the OH MY GIRL tab you can assign a member's Light into their Vocals/Dance/Charisma tracks by clicking
              "Allocate All Light".
            </p>

            <h4>Sparkles & Training tips</h4>
            <ul>
              <li><strong>Invest strategically</strong> — early on, boosting Vocals is often the most efficient; later,
                balanced investment across Dance & Charisma unlocks stronger group synergies.</li>
              <li><strong>Progress bars</strong> let you watch long-term training without micromanaging every second.
              </li>
            </ul>

            <h4>💫 MIRACLEs — The Power of the Fans</h4>
            <p>
              <strong>MIRACLEs</strong> are OH MY GIRL fans — the heart that fuels the stage.
              Every person in the world can become a MIRACLE, and MIRACLEs grow stronger as
              the members shine brighter.
            </p>

            <h5>How MIRACLEs are created</h5>
            <ul>
              <li>People start as <em>non-fans</em>.</li>
              <li>Leveling a member's <strong>Charisma</strong> converts non-fans into
                <strong>MIRACLEs</strong>.
              </li>
              <li>Higher Charisma = faster conversion and higher MIRACLE caps.</li>
            </ul>

            <h5>What MIRACLEs do</h5>
            <ul>
              <li>
                🌸 <strong>Boost all members' Light gain</strong> — every member shines brighter
                together.
              </li>
              <li>
                ✨ <strong>Boost all members' contribution to Miracle Light</strong> — MIRACLEs
                amplify how efficiently Light turns into Miracle Light.
              </li>
            </ul>

            <p class="mini">
              MIRACLEs scale multiplicatively with group systems — they never affect just one
              member, only the entire group.
            </p>

            <p class="yooa-voice">
              🌈 YooA whisper: “When one heart cheers, it's sweet… but when MIRACLEs cheer
              together, the whole world glows.” 💖
            </p>

            <h4>Buying upgrades</h4>
            <p>
              Upgrade purchases related to OH MY GIRL (lights, skill multipliers, group effects) are found in the
              <strong>OH MY GIRL</strong> tab's Upgrade Grid. Some upgrades unlock new skill behaviors, improve Sparkles
              generation, or increase the efficiency of Miracle Light.
            </p>

            <h4>Arin Tier & Arin-Proof autobuyers</h4>
            <p>
              <strong>Arin Tier</strong> is a special milestone tied to in-game ages. It unlocks when YooA's in-game
              age reaches <strong>7,214 days</strong> (this corresponds to Arin being 16 years old). Each Arin Tier
              requires an increasing amount of Miracle Light.
            </p>
            <p>
              Benefits of Arin Tier include:
            </p>
            <ul>
              <li><strong>Boost to Miracle Light gain</strong> — the group's Miracle Light production receives a
                multiplier
                per Arin Tier.</li>
              <li><strong>Arin-Proof autobuyer speed</strong> — a dedicated speed bonus that only affects Arin-Proof
                autobuyers (see below).</li>
            </ul>

            <h5>What are Arin-Proof autobuyers?</h5>
            <p>
              Arin-Proof autobuyers are a category of automation deliberately insulated from most global speed
              modifiers. They behave predictably and consistently even when the rest of your autobuyers are being
              hyper-boosted.
            </p>
            <ul>
              <li><strong>Not affected by general speed boosts:</strong> Arin-Proof autobuyers ignore general autobuyer
                speed multipliers (for example, ones from global upgrades or temporary buffs).</li>
              <li><strong>Affected only by Arin-Proof speed:</strong> the only speed modifier that affects them is the
                Arin-Proof autobuyer speed (for example, the bonus granted by Arin Tier or specific Arin upgrades).</li>
            </ul>

            <h4>YooAity Progression Tips</h4>
            <ol class="tips">
              <li><strong>Transcend for long-term growth:</strong> aim for meaningful YooA Essence payout so your next
                era is significantly stronger.</li>
              <li><strong>Use Echoes wisely:</strong> Shi-ah Echo multipliers and ember production are powerful
                mid-to-late game buys.</li>
              <li><strong>Time member unlocks:</strong> plan Transcensions so you can reach member birthdays soon after
                birth — they open new growth paths.</li>
              <li><strong>Upgrade Arin smartly:</strong> Arinium and Arin ranks dramatically improve automation — invest
                when you can.</li>
              <li><strong>Train skills passively:</strong> allocate Light and let Sparkles accumulate — focus only when
                a
                new skill tier unlocks to save time.</li>
            </ol>

            <p class="yooa-voice">🌈 YooA whisper: “Transcend with love — each rebirth makes the garden more enchanted.”
            </p>
          </article>

          <!-- ADVANCED TAB: paste into Help.vue inside the transition where other articles live -->
          <article v-else-if="currentTab === 'Advanced'" :id="'help-Advanced'" class="help-section">
            <h3>🔮 Advanced — Notation & Core Formulas</h3>
            <p class="lead">
              Welcome to the land of ultra-big numbers! 🌈✨
            </p>
            <p class="yooa-voice">YooA says: “Numbers grow so big here, even I need a magical calculator to keep up!” 🌸
            </p>

            <!-- Section: Notation -->
            <h4>📐 Notation</h4>
            <p>
              YooA Incremental uses <strong>scientific notation</strong> for large numbers by default.
            </p>
            <ul>
              <li><code>XeY</code> = X × 10^Y.
                Example: <code>1.4e9 = 1.4 × 10^9 = 1,400,000,000</code></li>
              <li>If X is missing, <code>eY</code> = 10^Y.
                Example: <code>e1,234,567,890 = 10^1,234,567,890</code></li>
              <li>Scientific notation can <em>stack</em>:
                <code>eXeY</code> = 10^(XeY).
                Example: <code>e1.0000e50 = 10^(1.0000e50) = 10^10^50</code>
              </li>
              <li>Multiple <code>e</code>'s stack deeper:
                <code>eeXeY = 10^10^(XeY)</code>.
                Example: <code>ee1.23e456 = 10^10^(1.23e456)</code>
              </li>
            </ul>

            <p>
              When numbers get <em>super magical</em>, the game switches to <strong>F Notation</strong>, used for
              <em>tetrational</em> numbers:
            </p>
            <ul>
              <li><code>Fy</code> = 10^^y (10 tetrated y times).
                Example: <code>F5 = 10^10^10^10^10</code></li>
              <li><code>xFy</code> = eee...eeex with y 'e's.
                Example: <code>1.234F5 = eeeee1.234 = 10^10^10^10^10^1.234</code></li>
              <li>You can mix with scientific notation:
                <code>F1.23e45 = 10^^(1.23e45)</code>
              </li>
            </ul>

            <p class="yooa-voice">
              🌟 YooA whisper: <em>“If you see a forest of e's and F's… don't panic! Each layer is just exponentiation
                stacked higher and higher.”</em> 🌸
            </p>

            <!-- Section: Tetration -->
            <h4>📚 Tetration explained</h4>
            <p>
              Tetration is <strong>repeated exponentiation</strong> — just like exponentiation is repeated
              multiplication.
            </p>
            <ul>
              <li><code>x ^^ y</code> = x raised to itself y times, from top down.</li>
              <li>Example: <code>10^^3 = 10^10^10</code>.</li>
            </ul>
            <p>
              Always solve tetration <em>from the top down</em>, because exponent towers are
              <strong>right-associative</strong>.
            </p>

            <!-- Section: Examples -->
            <h4>🌟 Notation examples</h4>
            <ul>
              <li><code>1.4e9 = 1.4 × 10^9 = 1,400,000,000</code></li>
              <li><code>9.17e1995 = 9.17 × 10^1995</code></li>
              <li><code>e1.0000e50 = 10^(1.0000e50) = 10^10^50</code></li>
              <li><code>ee1.23e456 = 10^10^(1.23e456)</code></li>
              <li><code>1.234F5 = 10^10^10^10^10^1.234</code></li>
              <li><code>F1.23e45 = 10^^(1.23 × 10^45)</code></li>
            </ul>

            <h4>📏 Engineering notation</h4>
            <p>
              Engineering notation is like scientific notation but tuned for human-readable engineering values: the
              exponent is
              always a multiple of <strong>3</strong>, and the mantissa is in the range <em>1 ≤ m &lt; 1000</em>.
            </p>
            <ul>
              <li><code>m × 10^e</code> with <code>e % 3 === 0</code> and <code>1 ≤ m &lt; 1000</code>.</li>
              <li>Example: <code>5.00 × 10^8</code> becomes <code>500.00e6</code> — the same numeric value, but exponent
                is a multiple of 3.</li>
              <li>Why use it? Engineers prefer grouping thousands (k, M, G) — engineering notation aligns neatly with SI
                prefixes.</li>
            </ul>

            <!-- NEW: Logarithm notation -->
            <h4>🧭 Logarithm notation (log10-based)</h4>
            <p>
              This notation writes numbers by their base-10 logarithm — basically scientific notation without the
              mantissa.
              Instead of <code>1.23e45</code>, log notation writes the exponent alone: <code>e45.09</code> or
              <code>log10(value)</code>.
            </p>
            <p>
              For very tall stacks of <code>e</code>'s (many leading <code>e</code> tokens), the UI truncates repeated
              <code>e</code>'s
              into a compact <code>(e^N)</code> expression. Example:
            </p>
            <ul>
              <li><code>eeeeeeeeee14</code> (10 e's followed by 14) is shown as <code>(e^10)14</code>.</li>
              <li>If the count of e's itself gets enormous, that count can be shown in scientific form (because even the
                number of e's becomes big).</li>
            </ul>

            <!-- NEW: Standard notation (short scale) -->
            <h4>💱 Standard notation (short scale)</h4>
            <p>
              Standard (short-scale) notation abbreviates large numbers using common names: thousand (k), million (M),
              billion (B),
              trillion (T), etc. It's very common in finance and everyday use.
            </p>
            <ul>
              <li>Example: <code>500,000,000</code> → <code>500 M</code> (500 million).</li>
              <li>Common suffixes: <code>k</code> (thousand = 1e3), <code>M</code> (million = 1e6), <code>B</code>
                (billion = 1e9),
                <code>T</code> (trillion = 1e12), and so on.
              </li>
              <li>Short-scale rule: each "-illion" is 1,000× the previous (1 billion = 1,000 million = 1e9).</li>
            </ul>
            <p class="mini">
              Use Standard when you want friendly, compact numbers for humans — it reads like finance or headlines.
            </p>

            <!-- NEW: Long scale -->
            <h4>📚 Long scale</h4>
            <p>
              Long scale is similar to Standard but defines each "-illion" as <strong>one million times</strong> the
              previous,
              rather than one thousand. That means a <strong>long-scale billion = 1e12</strong> (a million millions).
            </p>
            <ul>
              <li>Short scale: <code>1 billion = 1e9</code>.</li>
              <li>Long scale: <code>1 billion = 1e12</code> (a million millions).</li>
              <li>Because the names diverge for very large values, the game offers both so players from different
                cultures get familiar labels.</li>
            </ul>

            <!-- NEW: Mixed notation -->
            <h4>🔀 Mixed notation</h4>
            <p>
              Mixed notation automatically chooses the friendliest format:
            </p>
            <ul>
              <li>If the number is within a compact human-friendly range, use <strong>Standard letters</strong> (short
                or long scale depending on settings).</li>
              <li>If the number is extremely large or extremely small, switch to <strong>scientific</strong> or a higher
                notation (like
                <code>e</code> stacks or <code>F</code> notation).
              </li>
              <li>Typical thresholds (configurable): use Standard for &lt; 1e33 (short-scale) or &lt; 1e60 (long-scale);
                otherwise use higher notations.</li>
            </ul>

            <!-- NEW: Letter notation (deep) -->
            <h4>🔤 Letter notation (a, b, c, ... → aa, ab, ...)</h4>
            <p>
              Letters notation groups numbers in powers of 1,000 and uses lowercase letters in order:
              <code>a = 10^3</code>, <code>b = 10^6</code>, <code>c = 10^9</code>, <code>d = 10^12</code>, and so on.
            </p>
            <ul>
              <li>Example: <code>20,500</code> → <code>20.5a</code> (20.5 × 10^3).</li>
              <li><code>593,000,000</code> → <code>593b</code> (593 × 10^6).</li>
              <li>Sequence after <code>z</code> continues as <code>aa, ab, ac, ... az, ba, bb, ...</code> — this is
                effectively a bijective base-26 system using lowercase letters as "digits".</li>
            </ul>
            <p>
              YooA Incremental extends letter notation to extremely huge numbers using a multi-layered scheme:
            </p>
            <ul>
              <li>When the letter sequence itself would be too long, the notation switches to an uppercase-A form where
                the uppercase letter indicates "how many lowercase-letter groups" would be in the fully expanded
                expression.</li>
              <li>Once the number with the A gets over 1,000, the lowercase letters return: for example, 20Ab means
                1aaaaa... with 20b = 20,000,000 a's.</li>
              <li>Examples:
                <ul>
                  <li><code>50A</code> ≈ "an expression with 50 lowercase letter a's" — think of it as 1 followed by 50
                    a's.</li>
                  <li><code>14.5A</code> is "halfway between 14A and 15A" (a fractional measure meaning about halfway
                    between those two enormous letter-quantities).</li>
                  <li><code>3Bc</code> means "an A expression with 3c = 3e9 billion lowercase a's.</li>
                </ul>
              </li>
              <li>Uppercase cascade: <code>A → B → C → ...</code> : each uppercase step counts how many of the
                previous-letter-expressions there are
                (so <code>B</code> counts amounts of <code>A</code>, <code>C</code> counts amounts of <code>B</code>,
                etc.).</li>
              <li>When uppercase letters exceed Z, the scheme continues with <code>AA, AB, ...</code> in the same
                bijective style.</li>
              <li>At extreme heights the notation uses a special <code>@</code> layer: <code>32@</code> means "an
                expression with 32 uppercase-letter groups" or "1 followed by 32 uppercase A's".</li>
            </ul>
            <p class="mini">This system lets the UI represent unimaginably huge values in a compact, readable way.</p>

            <!-- NEW: 'Cancer' (emoji) notation -->
            <h4>😵 Cancer notation (emoji letters)</h4>
            <p>
              A playful variant of the letters system: lowercase/uppercase letter "digits" are replaced with emoji
              sequences.
              It's purely cosmetic — fun, chaotic, and readable once you memorise the emoji order.
            </p>
            <pre><code class="language-js">// Example arrays used by the game
            const letters = [
              "abcdefghijklmnopqrstuvwxyz", // lowercase
              "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // uppercase
              "@" // for TETRA-BIG numbers
            ];

            const emoji = [
              "😠🎂🎄💀🍆👪🌈💯🍦🎃💋😂🌙⛔🐙💩❓🚀🙈👍🔓✌🧇❌😋⚡",  // lowercase emoji (mapped to a..z)
              "🚨👶🍒😈💥👠🔫🏥👀🤹😵💻🔢🌑🍩💍👑🐇💰🏆🦄🌋🤷🩻🟡💤",  // uppercase emoji (mapped to A..Z)
              "😲" // super-tetra-big marker
            ];
              </code></pre>
            <p class="mini">Mapping: the nth emoji corresponds to the nth letter digit. For example, the first lowercase
              emoji (😠) = 'a', the second (🎂) = 'b', etc.</p>


            <!-- NEW: YooA notation -->
            <h4>🌱 YooA notation</h4>
            <p>
              YooA notation is a custom whimsical progression used across YooA Incremental to represent layers of growth
              tied to important dates.
              Notation evolves at thresholds connected to YooA's lore numbers (notably <strong>9.17</strong> and its
              powers).
            </p>
            <ul>
              <li>Numbers start normal (<code>x</code>), and at <strong>9.17</strong> become <code>🌱x</code>. Rule:
                <code>🌱x = x + 9.17</code>.
              </li>
              <li>At <code>🌱9.17</code> it upgrades to <code>🌿x</code>: <code>🌿x = 🌱(9.17×x)</code>.</li>
              <li>At <code>🌿9.17</code> it becomes <code>🌺x</code>: <code>🌺x = 🌿(9.17^x)</code>.</li>
              <li>At <code>🌺9.17</code> it becomes <code>🌈x</code>: <code>🌈x = 🌺(9.17^^x)</code> (tetration layer).
              </li>
              <li>Special symbols:
                <ul>
                  <li>Negative: <code>🥀</code></li>
                  <li>Reciprocal: <code>🍃</code></li>
                  <li>Zero: <code>⚰️</code></li>
                  <li>Infinity: <code>✨</code></li>
                  <li>NaN: <code>☠️</code></li>
                </ul>
              </li>
              <li>Example: <code>🌿5</code> is <code>🌱(9.17×5)</code> = <code>🌱45.85</code> =
                <code>45.85 + 9.17</code> = <code>55.02</code>
              </li>
              <li>Example: <code>🌺2</code> is <code>🌿(9.17^2)</code> = <code>🌿84.0889</code> =
                <code>🌱(9.17×84.0889)</code> = <code>🌱771.095213</code> = <code>771.095213 + 9.17</code> =
                <code>780.265213</code>
              </li>
            </ul>
            <p class="yooa-voice">🌸 YooA: “When numbers bloom past 9.17, sprinkle them with petals and call it
              notation.”</p>

            <!-- NEW: Arin notation -->
            <h4>🌙 Arin notation</h4>
            <p>
              Arin notation is a sibling system (Arin-themed) with different thresholds built around
              <strong>6.18</strong>.
            </p>
            <ul>
              <li>Normal numbers → at <code>6.18</code> become <code>🌙x</code> where <code>🌙x = x + 6.18</code>.</li>
              <li>At <code>🌙6.18</code> upgrade to <code>⭐x</code> with <code>⭐x = 🌙(6.18×x)</code>.</li>
              <li>Next: <code>💫x = ⭐(6.18^x)</code>, then <code>👑x = 💫(6.18^^x)</code> at the highest layers.</li>
              <li>Special symbols:
                <ul>
                  <li>Negative: <code>🌑</code></li>
                  <li>Reciprocal: <code>🌬️</code></li>
                  <li>Zero: <code>💤</code></li>
                  <li>Infinity: <code>♾️</code></li>
                  <li>NaN: <code>❓</code></li>
                </ul>
              </li>
            </ul>
            <p class="mini">Arin notation is meant to feel thematically different — calm, moonlit, and autogeneous
              (automation vibes).</p>

            <!-- NEW: IS-tropy notation -->
            <h4>🃏 IS-tropy notation</h4>
            <p>
              IS-tropy notation transforms numbers into a mystical <strong>card roster system</strong>,
              where every digit becomes a member of the IS roster. Instead of reading plain digits,
              enormous exponents are displayed as combinations of icons, names, or both.
            </p>

            <p>
              The notation is inspired by collectible card decks and identity-based encoding:
              each decimal digit corresponds to a unique character from the roster.
            </p>

            <ul>
              <li><code>0 → 🌀 Kyle</code></li>
              <li><code>1 → 🌱 Yssabelle</code></li>
              <li><code>2 → 🎨 Regina</code></li>
              <li><code>3 → 👋 Eishel</code></li>
              <li><code>4 → 🌑 Kimberly</code></li>
              <li><code>5 → 🔥 Ahn Jean</code></li>
              <li><code>6 → ⚡ Serille</code></li>
              <li><code>7 → 🌤 Alaine</code></li>
              <li><code>8 → 🌸 Euryle</code></li>
              <li><code>9 → 🍒 YooA</code></li>
            </ul>

            <h5>🎴 Display Modes</h5>
            <p>
              IS-tropy notation supports three display styles:
            </p>

            <ul>
              <li>
                <strong>Icons Mode</strong> — displays only emojis.
                <br>
                Example: <code>507</code> → <code>🔥🌀🌤</code>
              </li>

              <li>
                <strong>Names Mode</strong> — displays only names.
                <br>
                Example: <code>507</code> → <code>Ahn Jean Kyle Alaine</code>
              </li>

              <li>
                <strong>Both Mode</strong> — displays emoji + name together.
                <br>
                Example: <code>507</code> → <code>🔥 Ahn Jean 🌀 Kyle 🌤 Alaine</code>
              </li>
            </ul>

            <h5>🧠 How the formula works</h5>
            <p>
              IS-tropy notation is not just a digit replacement system — it compresses
              unimaginably huge values using a logarithmic entropy-like formula based on
              <strong>super-logarithms (slog)</strong>.
            </p>

            <p>
              The game first measures how "deep" a number is in exponential height using:
            </p>

            <p>
              <code>slog10(x)</code>
            </p>

            <p>
              This determines how many exponential layers the number contains.
              The result is then normalized against the game's maximum decimal layer,
              producing a transformed scientific value used for the final notation.
            </p>

            <p>
              Internally, the simplified structure looks like:
            </p>

            <pre><code class="language-js">
            num =
            10^((log10(slog10(value) + 1) / log10(slog10(MAX_LAYER) + 1)) × 1.5e9)
            </code></pre>

            <p>
              After the transformed number is generated:
            </p>

            <ul>
              <li>
                The <strong>mantissa</strong> is shown normally using scientific notation.
              </li>
              <li>
                The <strong>exponent</strong> is converted digit-by-digit into IS roster cards.
              </li>
            </ul>

            <p>
              Example:
            </p>

            <ul>
              <li>
                <code>1.23e456</code>
                might appear as:
                <code>1.23 🌑🔥⚡</code>
              </li>
              <li>
                because:
                <code>456 → 🌑🔥⚡</code>
              </li>
            </ul>

            <p>
              Extremely huge values therefore become compact "deck signatures"
              representing the entropy rank of the number rather than its raw exponent size.
            </p>

            <h5>🌌 Special states</h5>
            <ul>
              <li><code>🔥 [SUS ERROR] 🔥</code> — invalid or corrupted values (NaN).</li>
              <li><code>🌑 Cumpio Dark ...</code> — negative numbers.</li>
              <li><code>🚀 [MAX INVENTORY] 🚀</code> — infinite values.</li>
            </ul>

            <p class="mini">
              IS-tropy notation is designed for absurdly large incremental-game values where
              traditional notation becomes unreadable. Instead of showing gigantic exponent towers directly,
              it converts the number's logarithmic structure into a symbolic collectible-card identity.
            </p>

            <p class="yooa-voice">
              🃏 IS-tropy whisper:
              <em>“Every digit carries a soul. Build the right deck, and even infinity becomes collectible.”</em>
            </p>
            <!-- NEW: Blind & YesNo -->
            <h4>🔒 Blind notation & ✅ YesNo notation</h4>
            <p>
              Two extreme stylistic modes for the UI:
            </p>
            <ul>
              <li><strong>Blind notation</strong> — hides numeric values entirely and displays an empty string
                (<code>""</code>) in their place.
                Useful for challenge runs where you want to play blind or for comedic effect.</li>
              <li><strong>YesNo notation</strong> — every numeric value is reduced to a boolean-like expression:
                <ul>
                  <li><code>0 → NO</code></li>
                  <li><code>non-zero → YES</code></li>
                </ul>
                Example: <code>Auto Save interval: YESs</code>, or <code>You have YES YooAmatter</code>. It's joyous,
                chaotic, and absolutely not helpful for arithmetic — perfect for memes and emergency positivity.
              </li>
            </ul>

            <p class="yooa-voice">🌈 YooA whisper: “Pick your notation like you pick a hat — dramatic, functional, or
              entirely ridiculous.”</p>

            <!-- Quick examples / cheat sheet -->
            <h4>🧾 Quick cheat-sheet & examples</h4>
            <ul>
              <li><strong>Scientific:</strong> <code>1.23e45</code></li>
              <li><strong>Engineering:</strong> <code>123e42</code> (or <code>123 × 10^42</code> with exponent multiple
                of 3)</li>
              <li><strong>Letters:</strong> <code>20.5a</code> (thousands), <code>593b</code> (millions)</li>
              <li><strong>Logarithm:</strong> <code>45</code> (meaning 10^45), or <code>(e^10)14</code> for many stacked
                e's</li>
              <li><strong>YooA:</strong> <code>🌱5</code>, <code>🌿2</code>, <code>🌈1</code> (progressive mystical
                layers)</li>
              <li><strong>YesNo:</strong> <code>YES</code> / <code>NO</code></li>
            </ul>

            <p class="mini">Want a demo? Toggle notation in the game settings and watch a number change shape — it's
              like an outfit change for math.</p>

            <footer class="help-small">
              <small>
                Tip: notation preferences are purely visual — they don't change game math. Use the notation that makes
                your run most delightful.
              </small>
            </footer>

            <!-- Section: Math & Core Formulas -->
            <h4>📊 Math & Core Formulas</h4>
            <p>
              Most mechanics in YooA Incremental are powered by formulas.
            </p>
            <p class="yooa-voice">🌸 YooA explains: <em>“Symbols are our little dance steps in the math
                choreography!”</em> 🎶</p>
            <ul>
              <li><code>+</code> means addition.</li>
              <li><code>x</code> means multiplication.</li>
              <li><code>^</code> means exponentiation.</li>
              <li><strong>Dilation</strong>: raises the exponent of a number to a power.
                <br>Example: <code>1e44 dilated to 2 = 1e1936</code> (since 44^2 = 1936).
              </li>
              <li><strong>Trilation</strong>: <em>dilates</em> the exponent of a number to a power (raises the
                exponent's exponent).
                <br>Example: <code>e1e100 dilated to 2 = e1e200</code> (since 1e100^2 = 1e200), but
                <code>e1e100 trilated to 2 = e1e10000</code> (since 1e100 dilated to 2 = 1e10000).
              </li>
            </ul>
            <p>
              Formula for dilating x to y:
              <code>10^(log10(x)^y)</code>
            </p>
            <p>
              Formula for trilating x to y:
              <code>10^10^(log10(log10(x))^y)</code>
            </p>

            <p class="yooa-voice">
              🌸 YooA giggles: <em>“Dilating makes numbers bloom even faster, like magic flowers opening all at
                once!”</em> 🌸
            </p>
          </article>

          <!-- fallback -->
          <article v-else class="help-section">
            <h3>Help</h3>
            <p>Select a tab to view help content.</p>
          </article>

        </div>
      </transition>
    </main>

    <footer class="help-footer">
      <small>
        Need deeper mechanics? Click
        <button class="link-btn" @click="openAdvanced">Advanced Help</button>
        to explore notations, formulas, and more.
      </small>
    </footer>
  </section>
</template>

<script>
export default {
  name: 'Help',
  data() {
    return {
      tabs: [
        { key: 'YooA', label: 'YooA' },
        { key: 'YooAmatter', label: 'YooAmatter' },
        { key: 'YooAity', label: 'YooAity' }
      ],
      subtab: 'YooA'
    }
  },
  computed: {
    currentTab() {
      return this.subtab;
    }
  },
  methods: {
    changeTab(key) {
      this.subtab = key;
      // keep player's UI state consistent with the tab selection if global player exists
      try {
        if (typeof player !== 'undefined') {
          player.tab = 'Help';
          player.subtabs = player.subtabs || {};
          player.subtabs.Help = key;
        }
      } catch (e) {
        // ignore if player isn't available in this environment
      }
    },
    openAdvanced() {
      this.changeTab('Advanced');
      // Also keep the event if parent wants to listen
      this.$emit('open-advanced');
    }
  }
}
</script>

<style scoped>
.help-panel {
  background: linear-gradient(180deg, #0f1226 0%, #16162b 100%);
  color: #eafcff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.help-header h2 {
  margin: 0;
  font-size: 24pt;
  color: #ffd6f0;
}

.subtitle {
  margin: 4px 0 12px;
  color: #bfefff;
  font-size: 13pt;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  align-items: center
}

.spacer {
  flex: 1;
}

.tab-btn {
  background: #991893;
  border: none;
  padding: 8px 14px;
  color: #b9e5ff;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 700;
}

.tab-btn.active {
  background: #b9e5ff;
  color: #991893
}

.advanced-btn {
  background: transparent;
  color: #ffd6f0;
  border: 1px solid rgba(255, 214, 240, 0.12);
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.content-wrap {
  padding: 8px 12px
}

.help-section h3 {
  margin-top: 0;
  color: #ffd6f0;
  font-size: 20pt;
}

.help-section h4 {
  color: #e3b9ff;
  font-size: 16pt;
}

.help-section h5 {
  color: #c8b9ff;
  font-size: 14pt;
}

.lead {
  margin: 6px 0;
  color: #fff
}

.tiers {
  margin: 6px 0 12px 18px;
  color: #eafcff;
}

.note {
  color: #dff9ff;
  font-size: 0.95rem;
  margin-bottom: 10px;
}

dl {
  margin: 6px 0 12px;
}

dt {
  font-weight: 700;
  margin-top: 6px;
}

dd {
  margin: 4px 0 8px 12px;
  color: #eafcff;
}

.mini {
  color: #bfefff;
  font-size: 0.9rem;
  margin-top: 6px
}

.tips {
  margin-left: 18px;
  color: #fff
}

.yooa-voice {
  font-style: italic;
  color: #ffd6f0;
  margin-top: 8px
}

.help-footer {
  margin-top: 12px;
  text-align: center;
  color: #aeefff
}

.link-btn {
  background: transparent;
  border: none;
  color: #ffd6f0;
  cursor: pointer;
  text-decoration: underline;
  padding: 0
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0
}
</style>
