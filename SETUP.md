# External Services Setup

Two services need manual configuration before the site goes live: **Resend** (email) and **Sentry** (error tracking).

---

## 1. Resend — Email Notifications

When someone submits the contact form, Resend sends a notification email to your inbox.

### 1.1 Create an account

Go to https://resend.com and sign up with your Google account or email.

### 1.2 Add and verify your domain

1. In the Resend dashboard, go to **Domains** → **Add Domain**
2. Enter `nous.qa`
3. Resend will show you DNS records to add — they look like this:

```
Type    Name                        Value
TXT     resend._domainkey.nous.qa   p=MIGfMA0GCSqGSIb3DQEBA...
MX      send.nous.qa                feedback-smtp.us-east-1.amazonses.com
TXT     send.nous.qa                v=spf1 include:amazonses.com ~all
```

4. Log in to your domain registrar (wherever `nous.qa` is registered) and add these DNS records
5. Back in Resend, click **Verify** — this can take 5-30 minutes

> Until the domain is verified, use `onboarding@resend.dev` as `NOTIFY_FROM` for testing. It only delivers to the email address you signed up with.

### 1.3 Get your API key

1. In Resend, go to **API Keys** → **Create API Key**
2. Name it `nous-production`
3. Permission: **Sending access** only
4. Copy the key — it starts with `re_`

### 1.4 Set environment variables

**`apps/web/.env.local`** (local dev):
```
RESEND_API_KEY=re_your_key_here
NOTIFY_EMAIL=hello@nous.qa
NOTIFY_FROM=notify@nous.qa
```

**Vercel** (production — go to your `nous-web` project → Settings → Environment Variables):
```
RESEND_API_KEY        re_your_key_here
NOTIFY_EMAIL          hello@nous.qa
NOTIFY_FROM           notify@nous.qa
```

### 1.5 Test it

1. Run the web app locally: `pnpm dev` from the monorepo root
2. Fill in and submit the contact form at `http://localhost:3002/#contact`
3. Check your inbox at `hello@nous.qa` — the email should arrive within seconds
4. If nothing arrives, check the terminal for `[email]` log lines

---

## 2. Sentry — Error Tracking

Sentry catches unhandled errors in both the public website and the admin dashboard and sends you alerts.

### 2.1 Create an account

Go to https://sentry.io and sign up (free tier is sufficient to start).

### 2.2 Create two projects

Create one project for the web app and one for admin:

1. Click **Projects** → **Create Project**
2. Platform: **Next.js**
3. First project name: `nous-web`
4. Second project name: `nous-admin`

### 2.3 Get your DSN

After creating each project, Sentry shows a DSN (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/789012
```

Copy the DSN for each project.

### 2.4 Get an Auth Token (for source maps in CI)

Source maps let Sentry show you the original TypeScript code in stack traces instead of minified JS.

1. Go to **Settings** → **Auth Tokens** → **Create New Token**
2. Scopes needed: `project:releases`, `org:read`
3. Copy the token

### 2.5 Set environment variables

**`apps/web/.env.local`**:
```
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
SENTRY_ORG=nous-qa
SENTRY_PROJECT=nous-web
SENTRY_AUTH_TOKEN=sntrys_your_token_here
```

**`apps/admin/.env.local`**:
```
NEXT_PUBLIC_SENTRY_DSN=https://xyz789@o123.ingest.sentry.io/999
SENTRY_DSN=https://xyz789@o123.ingest.sentry.io/999
SENTRY_ORG=nous-qa
SENTRY_PROJECT=nous-admin
SENTRY_AUTH_TOKEN=sntrys_your_token_here
```

**Vercel — `nous-web` project**:
```
NEXT_PUBLIC_SENTRY_DSN    https://abc123@o123.ingest.sentry.io/456
SENTRY_DSN                https://abc123@o123.ingest.sentry.io/456
SENTRY_ORG                nous-qa
SENTRY_PROJECT            nous-web
SENTRY_AUTH_TOKEN         sntrys_your_token_here
```

**Vercel — `nous-admin` project**:
```
NEXT_PUBLIC_SENTRY_DSN    https://xyz789@o123.ingest.sentry.io/999
SENTRY_DSN                https://xyz789@o123.ingest.sentry.io/999
SENTRY_ORG                nous-qa
SENTRY_PROJECT            nous-admin
SENTRY_AUTH_TOKEN         sntrys_your_token_here
```

> `NEXT_PUBLIC_SENTRY_DSN` is the same value as `SENTRY_DSN` — one is exposed to the browser (for client-side errors), the other stays server-side.

### 2.6 Set your Sentry org slug

The `SENTRY_ORG` value is your organization slug in Sentry — find it at:
**Settings** → **General Settings** → **Organization Slug**

It is usually your username or company name lowercased with hyphens.

### 2.7 Test it

1. Deploy to Vercel (or run locally with the DSN set)
2. In Sentry, go to your `nous-web` project → **Issues**
3. To trigger a test error, temporarily add `throw new Error('sentry test')` to any Server Component, load the page, then remove it
4. The error should appear in Sentry within a few seconds with a full stack trace

### 2.8 Set up alert rules (recommended)

In each Sentry project → **Alerts** → **Create Alert**:

- **Trigger**: New issue created
- **Action**: Send email to `hello@nous.qa`
- **Frequency**: At most once per hour per issue

---

## 3. Uptime Monitoring (5 minutes, free)

No code needed — just configure a free account.

1. Go to https://betterstack.com/better-uptime (or https://uptimerobot.com)
2. Add these monitors:

| URL | Check every | Alert if down for |
|-----|-------------|-------------------|
| `https://nous.qa` | 3 min | 5 min |
| `https://admin.nous.qa` | 5 min | 10 min |

3. Set alert destination to `hello@nous.qa`

---

## 4. Complete Environment Variable Reference

### `apps/web/.env.local`
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend
RESEND_API_KEY=re_...
NOTIFY_EMAIL=hello@nous.qa
NOTIFY_FROM=notify@nous.qa

# Site
SITE_URL=https://nous.qa
REVALIDATE_SECRET=any-long-random-string

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=nous-qa
SENTRY_PROJECT=nous-web
SENTRY_AUTH_TOKEN=sntrys_...

# Local dev only
ALLOWED_DEV_ORIGINS=192.168.1.38
```

### `apps/admin/.env.local`
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site link (the "View Site" button in the dashboard)
NEXT_PUBLIC_SITE_URL=http://localhost:3002

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=nous-qa
SENTRY_PROJECT=nous-admin
SENTRY_AUTH_TOKEN=sntrys_...

# Local dev only
ALLOWED_DEV_ORIGINS=192.168.1.38
```
