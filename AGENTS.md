# Downtown Clawson DDA Website

## Project Overview
Static website for the Downtown Clawson Development Authority (DDA) in Clawson, Michigan. No build step — plain HTML, CSS, and JS served directly.

## Structure
- `index.html` — Homepage
- `about-dda.html` — About the DDA
- `business-directory.html` — Searchable business directory (reads from `data/businesses.js`)
- `happenings.html` — Events and happenings
- `restaurant-week.html` — Restaurant Week 2026 details
- `saturday-clawson-market.html` — Saturday market details
- `contact.html` — Contact page
- `data/businesses.js` — Business directory data (sets `window.DOWNTOWN_BUSINESSES`)
- `assets/css/styles.css` — All styles
- `assets/js/site.js` — Site-wide JS (nav toggle, scroll reveal, year)
- `assets/js/directory.js` — Business directory search/filter logic
- `images/` — All site images and brand assets

## Key Patterns
- Header, footer, and mobile nav are copy-pasted across all 7 HTML pages (no templating)
- Footer tagline is "Little City, Big Heart." — keep consistent across all pages
- Business data is a JS array on `window.DOWNTOWN_BUSINESSES`, not a JSON fetch
- No framework, no bundler, no dependencies

## Deployment

### Preview (S3)
```
aws s3 sync . s3://clawson-dda-preview --exclude ".git/*" --exclude ".gitignore" --exclude "README.md" --exclude ".claude/*" --exclude "AGENTS.md" --exclude "CLAUDE.md" --profile ride-ready
```

### Production (GoDaddy shared hosting via FTP)
- **Host:** ftp.downtownclawson.com, **Port:** 21
- **Credentials:** stored in `.claude/projects/.../memory/ftp-credentials.md`
- FTP drops into `public_html` directly (no path prefix needed)
- Use `lftp` — install with `brew install lftp` if not present

```
lftp -u "kevin@downtownclawson.com,PASSWORD" ftp://ftp.downtownclawson.com <<'LFTP'
set ssl:verify-certificate false
set xfer:clobber true
mirror --reverse --ignore-time \
  --exclude-glob .git/ \
  --exclude .gitignore \
  --exclude README.md \
  --exclude CLAUDE.md \
  --exclude AGENTS.md \
  --exclude-glob .claude/ \
  --exclude-glob .codex/ \
  --exclude-glob docs/ \
  --exclude .DS_Store \
  /Users/kevinschneider/Code/clawson-dda/ ./
quit
LFTP
```

**Notes:**
- `.htaccess` on the server handles http → https redirect — do not overwrite it unless intentional
- `wp-backup-2026-02/` contains the old WordPress files — do not delete
- Do NOT use GitHub Pages (conflicts with rideready.app custom domain on the GitHub account)

## Content Guidelines
- Never use em-dashes. Use commas, periods, or rewrite the sentence instead.
- Avoid generic/AI-sounding marketing copy ("vibrant", "thriving", "discover what we have to offer")
- Be specific to Clawson — reference real businesses, real events, real details
- Target audience is an equal mix of residents and newcomers
- The DDA's tagline is "Little City, Big Heart"
- Restaurant Week 2026: March 22-28, USA250 theme, $15-$25 specials, Passport stamp program

## Business Data (data/businesses.js)
- Every business should have a description (no empty strings)
- URLs must not contain spaces or tab characters
- Instagram fields must point to Instagram, not Facebook
- Avoid emoji in descriptions
