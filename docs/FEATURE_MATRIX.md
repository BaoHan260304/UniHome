# UniHome Complete - Feature Matrix

## Core marketplace
- Free landlord listing creation: implemented in `ListingController`.
- Mandatory moderation before public visibility: `DRAFT -> PENDING_REVIEW -> NEED_REVISION / ACTIVE / REJECTED / SUSPENDED`.
- 15-day freshness confirmation for free listings: `ListingMaintenanceService`.
- Listing history is preserved by status/archive; Property is separated from Listing.
- VIP/Featured/Boost is per listing, not per user post quota.
- Search: text, province, district, school, price, radius, property type, verification, sort.
- Login required before revealing phone/Zalo.
- Reviews and violation reports.
- Remote and on-site verification checklist.

## Matching
- MatchingProfile opt-in and checklist.
- Same-gender hard filter.
- Same-room pool from ListingInterest matchingEnabled=true.
- Nearby fallback up to 5 km using latitude/longitude.
- Deterministic weighted score; threshold >= 50%.
- AI explanation is optional and runs only on the backend.
- Social links supplied by the candidate can be displayed.
- Chat can be opened from room/matching context.

## Social / account
- Email/password registration and login.
- Passwords are PBKDF2 hashed; legacy plaintext passwords are upgraded after successful login.
- Forgot/reset password token flow.
- Google Identity Services login endpoint.
- Public profile, avatar, bio, social links, follower/following.
- Chat conversations/messages with context.
- Notification center.

## Money
- Wallet top-up by VietQR.
- Direct QR package purchase.
- Wallet package purchase.
- Payment history and wallet transaction history.
- VIP/Boost package plans.
- Finance dashboard and expense records.
- Payment demo endpoint is controlled by PAYMENT_DEMO and must be disabled in production.

## Ecosystem
- Service marketplace with moderation.
- Second-hand marketplace with category/search, comments and chat.
- Blog/CMS with draft/publish.
- Q&A community.
- Banner advertisement module managed by Admin; external destination URL.

## Admin
- Dashboard metrics.
- User/role/status management.
- Listing moderation.
- Verification records.
- Reports and review moderation.
- Finance, payments and package plans.
- Service moderation.
- Second-hand moderation.
- Blog management.
- Q&A moderation.
- Advertisement management.
- Audit log.

## External integration configuration
See `Huong_dan_cau_hinh_Google_Login_Map_QR_AI_UniHome.docx` for Google Login, coordinates/maps, VietQR, AI and admin bootstrap.
