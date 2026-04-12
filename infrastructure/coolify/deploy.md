# Barblink — Coolify Deployment Guide

## Prerequisites

1. **Hetzner VPS**: CX31 (2 vCPU / 8GB RAM / 80GB NVMe)
2. **Coolify**: Self-hosted PaaS installed on the VPS
3. **Domain**: barblink.com pointing to VPS IP via Cloudflare
4. **GitHub**: Repository connected to Coolify

## DNS Setup (Cloudflare)

```
barblink.com        → A record → VPS_IP (proxied)
www.barblink.com    → CNAME → barblink.com (proxied)
api.barblink.com    → A record → VPS_IP (proxied, SSL Full Strict)
admin.barblink.com  → A record → VPS_IP (proxied)
```

## Coolify Configuration

### 1. Infrastructure Stack

Deploy from `docker-compose.yml` with:

```bash
docker compose up -d postgres redis redpanda minio meilisearch
```

### 2. Backend Services

Deploy each service as a Docker application in Coolify:

| Service | Port | Domain |
|---------|------|--------|
| auth-service | 3001 | api.barblink.com/v1/auth/* |
| user-service | 3002 | api.barblink.com/v1/users/* |
| venue-service | 3003 | api.barblink.com/v1/venues/* |
| discovery-service | 3004 | api.barblink.com/v1/discovery/* |
| social-service | 3005 | api.barblink.com/v1/feed/*, /v1/posts/* |
| checkin-service | 3006 | api.barblink.com/v1/checkins/* |
| chat-service | 3007 | api.barblink.com/v1/chat/* |
| notification-service | 3008 | api.barblink.com/v1/notifications/* |
| scraper-service | 3009 | (internal only) |
| dj-service | 3010 | api.barblink.com/v1/dj/* |
| events-service | 3011 | api.barblink.com/v1/events/* |
| community-service | 3012 | api.barblink.com/v1/community/* |

### 3. Nginx Reverse Proxy

Use Coolify's built-in Traefik or configure Nginx to route:

```nginx
server {
    listen 443 ssl;
    server_name api.barblink.com;

    location /v1/auth/    { proxy_pass http://auth-service:3001; }
    location /v1/users/   { proxy_pass http://user-service:3002; }
    location /v1/venues/  { proxy_pass http://venue-service:3003; }
    location /v1/discovery/ { proxy_pass http://discovery-service:3004; }
    location /v1/feed     { proxy_pass http://social-service:3005; }
    location /v1/posts/   { proxy_pass http://social-service:3005; }
    location /v1/checkins/ { proxy_pass http://checkin-service:3006; }
    location /v1/chat/    { proxy_pass http://chat-service:3007; }
    location /v1/notifications/ { proxy_pass http://notification-service:3008; }
    location /v1/dj/      { proxy_pass http://dj-service:3010; }
    location /v1/events/  { proxy_pass http://events-service:3011; }
    location /v1/community/ { proxy_pass http://community-service:3012; }
    location /v1/admin/   { proxy_pass http://auth-service:3001; }
}

server {
    listen 443 ssl;
    server_name barblink.com www.barblink.com;
    location / { proxy_pass http://landing:3100; }
}

server {
    listen 443 ssl;
    server_name admin.barblink.com;
    location / { proxy_pass http://admin:3200; }
}
```

### 4. Environment Variables (Production)

Set these in Coolify for each service:

```bash
# Shared across all services
JWT_SECRET=<generate-strong-random-secret>
POSTGRES_USER=barblink
POSTGRES_PASSWORD=<generate-strong-password>

# Auth service
MAILGUN_API_KEY=<your-mailgun-key>
MAILGUN_DOMAIN=mg.barblink.com
DEV_OTP_BYPASS=false  # DISABLE in production!

# Grafana
GRAFANA_PASSWORD=<strong-password>
```

### 5. SSL

Coolify auto-provisions Let's Encrypt certificates for all domains.

## Quick Deploy Checklist

- [ ] VPS provisioned with Coolify
- [ ] Cloudflare DNS configured
- [ ] docker-compose infra running
- [ ] All 12 services deployed
- [ ] Nginx/Traefik routing configured
- [ ] Environment variables set (production secrets)
- [ ] SSL certificates active
- [ ] DEV_OTP_BYPASS disabled
- [ ] Monitoring stack running
- [ ] Seed 50 venues
- [ ] Test all endpoints from barblink.com
