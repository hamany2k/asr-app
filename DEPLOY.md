# asrkw.com — multi-page build

Four public pages instead of one scrolling page, so each of Google's three
requirements has its own URL a reviewer can open directly.

| URL | File | Covers |
|---|---|---|
| `/` | `index.html` | Hero, what ASR is, business model summary |
| `/about` | `about.html` | The company, both revenue engines, values, founder |
| `/products` | `products.html` | Bloom (live) and ASR Coffee (Oct 2026) in full |
| `/contact` | `contact.html` | Direct email, details, contact form |

Shared `assets/css/site.css` and `assets/js/site.js` — same tokens, fonts and
behaviour as the single-file version, extracted so all four pages stay in sync.
Also added: `robots.txt`, `sitemap.xml`, and Organization JSON-LD on `/` and
`/about` so crawlers can read the business, founder and products as structured data.

## nginx — clean URLs

Links point at `/about`, not `/about.html`. Add this to your server block:

```nginx
root /usr/share/nginx/html;
index index.html;

location / {
    try_files $uri $uri.html $uri/ =404;
}

# long cache for versioned assets
location /assets/ {
    expires 30d;
    add_header Cache-Control "public";
}
```

Then reload: `sudo nginx -t && sudo systemctl reload nginx`

Without `$uri.html` in `try_files`, every nav link returns 404.

## Deploy

```bash
cd ~/asr-app
git pull
sudo rsync -av --delete ./ /usr/share/nginx/html/ --exclude .git --exclude DEPLOY.md
sudo systemctl reload nginx
```

## Still to do

1. **The contact form.** It still posts to `https://formspree.io/f/YOUR_FORM_ID`.
   It isn't dead — the JS falls back to opening the visitor's mail app — but that
   is a poor experience and some visitors will bounce. Either put a real Formspree
   ID in, or point the form at the .NET app when it's ready.
2. **Images.** There are placeholders for Bloom screenshots and ASR Coffee
   photography, plus an OG social card at `/assets/og-cover.jpg`. Real images make
   the product claims far more credible to a reviewer.
3. **Verify it's actually live.** Open each of the four URLs in a private window
   before re-applying.
