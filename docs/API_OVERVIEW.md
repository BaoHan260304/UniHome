# UniHome API Overview

Base URL: `/api`

## Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `PUT /auth/me`
- `POST /auth/change-password`

Authenticated requests send `X-Auth-Token`.

## Marketplace / Listings
- `GET /marketplace/listings`
- `GET /marketplace/listings/{id}`
- `GET /marketplace/listings/{id}/contact`
- `GET /listings/mine`
- `POST /listings`
- `PUT /listings/{id}`
- `POST /listings/{id}/submit`
- `POST /listings/{id}/confirm-availability`
- `POST /listings/{id}/archive`
- `POST /listings/{id}/interest`
- `DELETE /listings/{id}/interest`
- `POST /listings/{id}/favorite`

## Matching
- `GET /matching/profile`
- `PUT /matching/profile`
- `GET /matching/listing/{listingId}`
- `GET /matching/nearby?radiusKm=5`

## Chat / Profiles
- `GET /users/{id}/public`
- `POST /users/{id}/follow`
- `GET /chat/conversations`
- `POST /chat/conversations`
- `GET /chat/{conversationId}/messages`
- `POST /chat/{conversationId}/messages`

## Payment
- `GET /payments/wallet`
- `GET /payments/plans`
- `POST /payments/topup`
- `POST /payments/listing/{listingId}/direct`
- `POST /payments/listing/{listingId}/wallet`
- `GET /payments/history`

## Ecosystem content
- `/content/services`
- `/content/secondhand`
- `/content/blogs`
- `/content/questions`
- `/content/ads`

## Admin
Base: `/admin`
- `/dashboard`
- `/users`
- `/moderation`
- `/listings/{id}/moderate`
- `/verifications`
- `/reports`
- `/payments`
- `/finance`
- `/plans`
- `/services`
- `/secondhand`
- `/questions`
- `/answers`
- `/reviews`
- `/blogs`
- `/ads`
- `/audit`
