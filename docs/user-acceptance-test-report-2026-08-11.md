# User Acceptance Test Report

**Execution date:** 2026-08-11  
**Environment:** `http://localhost:3000` with the already-running backend  
**Role tested:** User account supplied privately by the project owner  
**Browser:** Integrated browser, desktop viewport  
**Credentials:** Not recorded in this report

## Summary

- Static environment check: **PASS with optional-tool warning**
- Database file check: **PASS**
- UI TypeScript check: **PASS**
- Production build: **PASS**
- Primary user booking journey: **PASS**
- Primary user product purchase journey using COD: **PASS**
- User role access control: **PASS**
- Admin dashboard and read-only management pages: **PASS**
- Admin completed-order metric behavior: **PASS**
- Simulated online payment requirement: **IMPLEMENTED; execution not repeated in this run**
- Conflict and direct database checks: **BLOCKED / NOT EXECUTED**

## Executed Results

| Case | Result | Evidence |
|---|---|---|
| U-001 | PASS | Home page rendered navigation, booking/shop CTAs, contact information, and footer. |
| U-003 | PASS | User login succeeded; navbar showed `Tuan Thong`. |
| U-101 to U-106 | PASS | Booking page showed future dates, disabled past/current invalid slots, availability, occupied courts, and selectable courts. |
| U-107 | PASS | Selected court 3; price was 69,000đ for one 2-hour slot. |
| U-109 to U-111 | PASS | Confirmation showed date `11/08/2026`, `17:00-19:00`, court 3, autofilled user details, and successful submission. |
| U-112 | PASS | Booking history showed booking `#53`, court 3, date/time, UAT note, and `Đã xác nhận`. |
| U-201 to U-205 | PASS | Shop loaded product data, categories, sort control, stock, discount, and add-to-cart control. Victor wristband was added successfully. |
| U-207 to U-210 | PASS | Cart showed one item at 90,250đ, shipping 50,000đ, and total 140,250đ. |
| U-211 to U-216 | PASS for COD | Checkout autofilled user details, accepted address, switched to COD, and created order `#ORD-000023`. |
| U-217 | PASS | Payment success showed COD status, one item, 90,250đ product total, 50,000đ shipping, and 140,250đ final total. |
| U-218 | NOT VERIFIED | Stock was visible before purchase, but direct stock comparison requires database/API verification. |
| U-219 | NOT EXECUTED | Requires a controlled insufficient-stock fixture. |
| U-301 | PASS | Profile displayed name, email, phone, and role `Khách hàng`. |
| U-006 | PASS | After logout, opening `/profile` redirected to `/auth`. |
| A-001 | PASS for user denial | Opening `/admin` as the user redirected to `/`. |
| A-002 | PASS | Admin login succeeded; dashboard showed 950,800đ booking revenue, 18 total bookings, 14 confirmed bookings, and 0 blocked slots. |
| A-003 | PASS for read-only coverage | Admin booking management loaded 18 bookings, status filtering, search, and booking action controls. |
| A-007 | PASS for read-only coverage | Pricing management loaded the editable weekday/weekend/special-day price table and reset/save controls. No price was changed. |
| A-008 | PASS for read-only coverage | Shop management loaded category/product controls, search, refresh, and add-product controls. No product was changed or deleted. |
| A-009 | PASS | Admin order history loaded all orders and status selectors. |
| A-010 | PASS | Changing UAT order `#ORD-000023` to `Hoàn Tất` changed metrics from 11 orders / 16,974,000đ to 12 orders / 17,114,250đ; restoring `Chờ xác nhận` restored the original metrics. |

## Observed Transaction Evidence

### Court booking

- Booking reference: `#0000000053`
- Backend booking ID: `53`
- Date: `11/08/2026`
- Time: `17:00-19:00`
- Court: `Sân 3`
- Displayed total: `69,000 đ`
- Note: `UAT-20260811`
- History status: `Đã xác nhận`

At the selected slot, the UI reported `8/10 sân trống` and disabled courts 1 and 2.

### Product purchase

- Order reference: `#ORD-000023`
- Product: `Băng cổ tay Victor x1`
- Product subtotal: `90,250 đ`
- Shipping: `50,000 đ`
- Final total: `140,250 đ`
- Payment method: `Thanh toán khi nhận hàng`
- Payment status: `Chờ thanh toán khi nhận hàng`
- Order status in user history: `Chờ xác nhận`
- Address used: `123 Nguyen Trai, Phuong 1, Quan 3, Can Tho`

## Blocked or Not Yet Executed

1. Online/mock-card checkout was not submitted to avoid creating an unnecessary second order. The checkout screen explicitly identifies online payment as simulated, which matches the project requirement. Run it once with approved test data only if presentation evidence is needed.
2. Booking conflict testing needs a second browser/session or a second user attempting the same court/date/time.
3. Admin mutation testing remains pending: booking confirmation/cancellation, court changes, pricing save, and product CRUD were not executed to avoid changing shared business data. Order status and revenue behavior were tested with the UAT order and restored to its original pending state.
4. Direct stock/database verification needs PostgreSQL access or an approved API inspection method. `psql` is not installed in the current environment.
5. Profile edit and password-change success paths were not submitted because they modify the shared test account. Their validation paths still need a controlled run.
6. Mobile viewport, second-browser, keyboard-accessibility, duplicate-submit, and network-failure checks were not executed in this browser pass.

## Test Data Cleanup

The run created booking `#53` and product order `#ORD-000023`. Before presentation, an administrator should either remove these UAT records or clearly label them as demonstration data. Do not delete unrelated existing records.

## Release Recommendation

The two primary user journeys are working end to end in the live environment, and simulated online payment matches the project requirement. The project should be considered **ready for council demonstration**, with conflict, stock, mobile, and account-modification checks documented as follow-up validation rather than missing required functionality.
