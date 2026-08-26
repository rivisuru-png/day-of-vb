// Fetches current free-game giveaways (Steam + Epic) from the GamerPower API
// and writes them to free-games.json in the format the site's homepage expects.
// Runs server-side via GitHub Actions, so there's no browser CORS restriction.
const https = require('https');
const fs = require('fs');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      { headers: { 'User-Agent': 'day-of-vb-site-bot (+https://rivisuru-png.github.io/day-of-vb/)' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response: ' + e.message));
          }
        });
      }
    ).on('error', reject);
  });
}

function detectPlatform(entry) {
  const raw = (entry.platforms || entry.platform || '').toString().toLowerCase();
  if (raw.includes('epic')) return 'epic';
  if (raw.includes('steam')) return 'steam';
  return 'epic';
}

async function main() {
  const url = 'https://www.gamerpower.com/api/giveaways?platform=epic-games-store+steam&type=game&sort-by=date';
  let raw;
  try {
    raw = await fetchJson(url);
  } catch (e) {
    console.error('Fetch failed, leaving free-games.json unchanged:', e.message);
    process.exit(0); // don't fail the workflow - just skip this run
  }

  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (Array.isArray(raw.giveaways)) list = raw.giveaways;
  else if (raw.data && Array.isArray(raw.data.free_games)) list = raw.data.free_games;

  if (!list.length) {
    console.log('No active giveaways returned - leaving free-games.json unchanged.');
    process.exit(0);
  }

  const games = list.slice(0, 6).map((g) => ({
    name: g.title || g.name || 'Unknown Game',
    platform: detectPlatform(g),
    url: g.open_giveaway_url || g.gamerpower_url || g.game_url || 'https://www.gamerpower.com/',
    until: (g.end_date || g.expiration_date || g.date || '').toString().slice(0, 10),
  }));

  const out = {
    updated: new Date().toISOString().slice(0, 10),
    games,
  };

  fs.writeFileSync('free-games.json', JSON.stringify(out, null, 2) + '\n');
  console.log('Wrote free-games.json with', games.length, 'entries.');
}

main();
