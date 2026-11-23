// Saves site edits to GitHub. POST only. No npm packages.
// Env: ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO (owner/name), optional GITHUB_BRANCH (default main)
const MAX_BODY = 5 * 1024 * 1024;
const J = (status, obj) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj),
});

function safePath(p) {
  return typeof p === 'string' && p.length > 0 && p.length < 200 &&
    !p.startsWith('/') && !p.includes('..') && !p.includes('\\') &&
    !p.startsWith('.git') && !p.startsWith('netlify/') && p !== 'netlify.toml' &&
    /^[A-Za-z0-9._\-\/ ]+$/.test(p);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return J(405, { error: 'POST only' });

  const { ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO } = process.env;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  const missing = ['ADMIN_PASSWORD', 'GITHUB_TOKEN', 'GITHUB_REPO'].filter((k) => !process.env[k]);
  if (missing.length) return J(500, { error: 'variable missing', missing });

  const raw = event.body || '';
  const size = event.isBase64Encoded ? Math.floor(raw.length * 0.75) : Buffer.byteLength(raw);
  if (size > MAX_BODY) return J(400, { error: 'payload too large' });

  let data;
  try {
    data = JSON.parse(event.isBase64Encoded ? Buffer.from(raw, 'base64').toString('utf8') : raw);
  } catch (e) {
    return J(400, { error: 'bad payload' });
  }
  if (!data || typeof data !== 'object') return J(400, { error: 'bad payload' });
  if (data.password !== ADMIN_PASSWORD) return J(401, { error: 'wrong password' });

  const api = 'https://api.github.com/repos/' + GITHUB_REPO;
  const gh = (path, opts = {}) =>
    fetch(api + path, {
      ...opts,
      headers: {
        Authorization: 'Bearer ' + GITHUB_TOKEN,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'site-editor',
        ...(opts.headers || {}),
      },
    });
  const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

  try {
    if (data.action === 'check') return J(200, { ok: true });

    if (data.action === 'publish') {
      const files = data.files;
      if (!Array.isArray(files) || !files.length || files.length > 60) return J(400, { error: 'bad payload' });
      for (const f of files) {
        if (!f || !safePath(f.path) || typeof f.content !== 'string') return J(400, { error: 'bad payload' });
      }
      const message = String(data.message || 'Site edit').slice(0, 200);
      const saved = [];
      for (const f of files) {
        let sha;
        const cur = await gh('/contents/' + enc(f.path) + '?ref=' + encodeURIComponent(BRANCH));
        if (cur.status === 200) sha = (await cur.json()).sha;
        else if (cur.status !== 404) return J(502, { error: 'could not save', detail: 'GitHub said ' + cur.status + ' for ' + f.path });
        const b64 = f.encoding === 'base64' ? f.content : Buffer.from(f.content, 'utf8').toString('base64');
        const put = await gh('/contents/' + enc(f.path), {
          method: 'PUT',
          body: JSON.stringify({ message, content: b64, branch: BRANCH, ...(sha ? { sha } : {}) }),
        });
        if (!put.ok) {
          const t = await put.text();
          return J(502, { error: 'could not save', detail: 'GitHub said ' + put.status + ' for ' + f.path + ': ' + t.slice(0, 200), saved });
        }
        saved.push(f.path);
      }
      return J(200, { ok: true, saved });
    }

    if (data.action === 'backups') {
      const r = await gh('/commits?sha=' + encodeURIComponent(BRANCH) + '&per_page=30');
      if (!r.ok) return J(502, { error: 'could not read history', detail: 'GitHub said ' + r.status });
      const list = await r.json();
      return J(200, {
        ok: true,
        commits: list.map((c) => ({
          sha: c.sha,
          date: c.commit.author && c.commit.author.date,
          message: (c.commit.message || '').split('\n')[0].slice(0, 120),
        })),
      });
    }

    if (data.action === 'restore') {
      if (!safePath(data.path) || !/^[0-9a-f]{7,40}$/.test(String(data.sha || ''))) return J(400, { error: 'bad payload' });
      const r = await gh('/contents/' + enc(data.path) + '?ref=' + data.sha);
      if (r.status === 404) return J(404, { error: 'file did not exist at that backup' });
      if (!r.ok) return J(502, { error: 'could not read backup', detail: 'GitHub said ' + r.status });
      const j = await r.json();
      return J(200, { ok: true, content: Buffer.from(j.content || '', 'base64').toString('utf8') });
    }

    return J(400, { error: 'bad payload' });
  } catch (e) {
    return J(502, { error: 'could not save', detail: String(e && e.message || e).slice(0, 200) });
  }
};
