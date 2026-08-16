# User Acceptance Test Plan

## 1. Purpose

Validate the complete badminton booking and product shopping experience before the council presentation. The test order starts with the normal user journey, then covers account management, negative cases, administrator workflows, and cross-cutting quality checks.

This is a test plan, not a production test report. Each case must be executed and marked `PASS`, `FAIL`, or `BLOCKED` with evidence before presentation.

## 2. Test Environment

- Frontend: `http://localhost:3000`
- Backend: Spring Boot at `http://localhost:8080`
- Database: configured project PostgreSQL database with seed data
- Browser: latest Chrome or Edge; repeat critical flows in a second browser
- Viewports: desktop `1440x900` and mobile `390x844`
- Test account: use the user-role account supplied privately by the project owner. Do not put its password in this file, screenshots, source code, or tickets.
- Test payment data: use approved non-production/mock card data only. Do not use a real card.

## 3. Preconditions and Controls

Before each run:

1. Start PostgreSQL, backend, and frontend.
2. Run `npm run check:env`.
3. Run `npm run check:db`.
4. Run `npm run check:ui`.
5. Confirm the browser can load `/`, `/booking`, and `/shop`.
6. Record the database product stock, court availability, and existing order/booking counts.
7. Use future dates and time slots that are at least one hour from the current time.
8. Create a unique test marker in optional notes or address fields where possible, for example `UAT-YYYYMMDD`.

Do not delete or alter existing business data without an approved backup and cleanup plan.

## 4. Evidence Standard

For every case record:

- Case ID and execution date/time
- Browser and viewport
- Actual result
- PASS, FAIL, or BLOCKED
- Screenshot for visible outcomes
- Order ID or booking ID for successful transactions
- Relevant backend response or database check for data integrity
- Defect reference for failures

A flow is accepted only when both the UI result and persisted backend result are correct.

## 5. Execution Order

### Phase A: User Flow First

Run these in order using the supplied user-role account.

### A1. Public navigation and authentication

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| U-001 | Home page loads | Open `/` | Hero, navigation, booking CTA, shop CTA, and footer render without errors. |
| U-002 | Public navigation | Open booking, shop, contact, and home links from desktop navigation | Each link reaches the correct route. No broken link or console error. |
| U-003 | User login | Open `/auth`; enter the supplied username and password; submit | Login succeeds, token and user session are created, and user is redirected home. Navbar shows the user name. |
| U-004 | Invalid login | Submit a wrong password | Login is rejected with a user-friendly error; no session is created. |
| U-005 | Logout | Open the user menu and choose logout | Token/user data are removed, user returns to home, and protected pages redirect to `/auth`. |
| U-006 | Protected route while logged out | Open `/profile`, `/profile/history`, `/profile/orders`, `/profile/password`, and `/checkout` after logout | Each protected page redirects to `/auth`; no private data is shown. |

### A2. Booking a court

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| U-101 | Booking page initial state | Open `/booking` while logged in | Today is selected, past dates are disabled, time slots load, and all 10 courts are shown unless occupied. |
| U-102 | Select a future date | Move to a future month/date and select it | Selected date is highlighted; past dates cannot be selected. |
| U-103 | Select a valid time | Select an available future time slot | Slot is highlighted, price is shown, and availability is requested for that date/time. |
| U-104 | Current-day cutoff | Select today and inspect slots less than one hour from now | Those slots are disabled and cannot be selected. |
| U-105 | Availability display | Choose a slot with occupied courts | Occupied courts are visibly unavailable and cannot be selected; available count is correct. |
| U-106 | Select one court | Select one available court | Court becomes selected and the total equals the configured price for one court. |
| U-107 | Select multiple courts | Select two or more available courts | Each court is selected, and total equals price-per-court multiplied by selected court count. |
| U-108 | Continue without selection | Leave time or courts unselected and attempt to continue | Continue is disabled or does not navigate; no incomplete booking draft is created. |
| U-109 | Continue to confirmation | Select a valid date, time, and court; continue | Draft is stored and `/booking/confirm` opens with matching date, time, courts, and amount. |
| U-110 | User details autofill | Inspect confirmation while logged in | Name, phone, and email are populated from the account; notes remain editable. |
| U-111 | Booking confirmation success | Submit valid confirmation data | One booking is created per selected court, success page shows a reference, date, time, courts, and total, and the draft is cleared. |
| U-112 | Booking history | Open `/profile/history` | The new booking(s) appear under the correct user with correct court, date, time, ID, and `Đã xác nhận` status. |
| U-113 | Booking conflict | In a second session, try to book the same court/date/time | The backend rejects the conflict; the user sees an error and no duplicate booking is created. |
| U-114 | Availability changes during selection | Select a slot, occupy/cancel a court from another session, then wait for refresh or refocus | The changed court becomes unavailable or available and selected courts are reconciled correctly. |
| U-115 | Invalid confirmation data | Try numeric-only/one-character name, invalid phone, and invalid email separately | Submission is blocked with the correct validation message and no booking is created. |
| U-116 | Missing booking draft | Open `/booking/confirm` directly with no draft | User is redirected to `/booking`; no empty confirmation page is displayed. |
| U-117 | Success page without result | Open `/booking/success` directly after clearing the result | User is redirected home and no fake booking details are shown. |

### A3. Buying products

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| U-201 | Shop loads | Open `/shop` | Products, image/fallback, brand, price, discount, rating, stock, and add-to-cart controls render. |
| U-202 | Product loading/error state | Reload during backend outage or simulate a failed product request | A clear error is shown; the page does not show misleading product data. |
| U-203 | Category filter | Select each available category, then `Tất cả` | Only products in the selected category appear; all products return for `Tất cả`. |
| U-204 | Sorting | Select newest, price ascending, and price descending | Product order matches the selected sort and uses discounted prices where applicable. |
| U-205 | Add product to cart | Add one in-stock product | Cart count increases and the item appears in `/cart` with the correct price and quantity. |
| U-206 | Add same product again | Add the same product again | Quantity increases rather than creating an incorrect duplicate line. |
| U-207 | Cart quantity controls | Increase and decrease quantity | Quantity and line total update correctly; quantity cannot exceed stock and cannot become invalid. |
| U-208 | Remove item | Remove an item from cart | Item disappears and subtotal, shipping, total, and cart count recalculate. |
| U-209 | Empty cart | Remove all items or open `/cart` with an empty cart | Empty-cart state appears with a link back to `/shop`; checkout cannot proceed. |
| U-210 | Shipping calculation | Test subtotal below, at, and above the free-shipping threshold | Shipping changes exactly at the configured threshold and the displayed total is correct. |
| U-211 | Checkout guard | Log out and open `/checkout` with an item in cart | User is redirected to `/auth`; cart contents are preserved. |
| U-212 | Checkout autofill | Log in and open checkout | Customer name, email, and phone are prefilled from the account. |
| U-213 | Checkout required fields | Clear each required address/contact field and submit | Submission is blocked with the corresponding validation error. |
| U-214 | Checkout format validation | Test invalid email, phone, card number, expiry, and CVV | Each invalid value is rejected before order creation. |
| U-215 | COD purchase | Use a valid cart and select `Thanh toán khi nhận hàng`; submit | Order is created, cart is cleared, success page shows the order ID, COD status, items, shipping, and total. |
| U-216 | Online purchase | Use a valid cart and select `Thanh toán ngay` with approved mock card data | Order is created, success page shows payment success, order details, and total. No real payment is sent. |
| U-217 | Order persistence | Open `/profile/orders` after either purchase | The order appears for the logged-in user with correct items, quantities, price, shipping, payment status, and order status. |
| U-218 | Stock update | Compare product stock before and after a successful purchase | Stock decreases by the purchased quantity and cannot become negative. |
| U-219 | Insufficient stock | Attempt to buy more than current stock, including a stale-cart case | Add/checkout is blocked or backend rejects the order; no partial order is created and stock is unchanged. |
| U-220 | Invalid payment-success URL | Open `/payment/success` without an order ID or with a nonexistent ID | A clear error is shown and no unrelated order details are exposed. |

### A4. User account management

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| U-301 | Profile display | Open `/profile` | Correct name, email, phone, and user role are loaded from the backend. |
| U-302 | Edit valid profile | Open `/profile/edit`, change name/email/phone to valid values, save | Success message appears, data persists after reload, and profile shows the new values. |
| U-303 | Edit invalid profile | Try invalid name, email, and phone | Errors appear beside the invalid fields; no partial update is persisted. |
| U-304 | Change password validation | Open `/profile/password`; test blank, short, no-letter, no-number, and mismatch cases | Validation blocks submission with the correct message. |
| U-305 | Change password success | Change to a new approved test password, log out, and log in again | New password works, old password fails, and the account remains a user account. Restore the original test password if required. |
| U-306 | Session expiry/unauthorized response | Use an expired or removed token, then open profile/history/orders | Session is cleared and user is redirected to login without exposing private data. |

### Phase B: Administrator Flow

Use a separate approved admin account. Never change the supplied user account to admin.

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| A-001 | Admin access control | Open `/admin` logged out and as the user account | Logged-out users go to `/auth`; user-role accounts go to `/`; admin pages reveal no data. |
| A-002 | Admin dashboard | Log in as admin and open `/admin` | Dashboard loads booking totals, confirmed totals, blocked slots, revenue, and recent activity. |
| A-003 | Booking management | Open `/admin/bookings`; search by name/ID and filter status | Results match the query and selected status. |
| A-004 | Confirm booking | Confirm a pending booking | Status changes to confirmed and related counts/revenue update correctly. |
| A-005 | Cancel booking | Cancel a confirmed booking and confirm the browser prompt | Status changes to cancelled, court availability returns, and stats refresh. |
| A-006 | Change court | Move a booking to another available court | Booking shows the new court; a conflicting court is rejected. |
| A-007 | Pricing management | Open `/admin/pricing`, change one weekday/weekend/special-day price, save, reload | Saved value persists and a new booking uses the correct price. Reset the test value afterward. |
| A-008 | Product/category management | Open `/admin/shop`; create, edit, and delete a test category/product | CRUD operations persist, validation works, and user shop reflects the final state. |
| A-009 | Product order status | Open `/admin/order-history`; move a test order through statuses | Status labels persist and user order history reflects the same state. |
| A-010 | Completed order metrics | Mark a test product order `COMPLETED` and then move it away from completed | Completed-order count and total revenue increase/decrease using `totalAmount + shippingAmount`. |

## 6. Cross-Cutting Checks

- Refresh every success, history, and profile page; data must remain correct.
- Use browser Back/Forward through booking, cart, checkout, and success pages.
- Test desktop and mobile layouts; verify no clipped buttons, overlapping text, or inaccessible controls.
- Verify keyboard navigation, visible focus, form labels, and select/button usability.
- Confirm loading, empty, error, unauthorized, and disabled states are understandable.
- Check browser console and network requests for uncaught errors, failed requests, leaked tokens, or duplicate submissions.
- Double-click booking and checkout submit buttons; only one transaction should be created.
- Refresh after a failed request; controls should recover without a full data reset.
- Verify Vietnamese labels, currency formatting, dates, and time ranges.
- Verify no password, token, card number, or CVV appears in URL, localStorage screenshots, console output, or error messages.

## 7. Data Integrity Checks

After successful booking:

- Booking count equals selected court count.
- Each booking has the same user, date, time, and notes.
- The selected court/time is no longer available.
- A duplicate request does not create another booking.

After successful product order:

- Exactly one order is created.
- Order items and quantities match the cart.
- `totalAmount` equals the item subtotal and `shippingAmount` follows the configured rule.
- Displayed total equals `totalAmount + shippingAmount`.
- Stock is decremented exactly once.
- The order is visible only to its owner in `/profile/orders`.

## 8. Exit Criteria

The project is ready for council demonstration when:

- All `U-*` critical cases pass: authentication, booking success, booking history, cart, COD purchase, online purchase/mock payment, order history, profile, and access control.
- No unresolved severity-1 or severity-2 defects remain.
- The backend/database evidence matches the UI for at least one booking and one product order.
- `npm run check:env`, `npm run check:db`, `npm run check:ui`, and `npm run build` complete successfully.
- A clean demo account and clean demo data are prepared.
- Screenshots and IDs for the two primary journeys are collected.

## 9. Recommended Automation Follow-Up

There is currently no browser test runner in the project. Add Playwright after the first manual pass and automate these smoke tests first:

1. User login and logout.
2. Booking one available court through success and history.
3. Add product, checkout with COD, and verify order success/history.
4. Checkout redirect for a logged-out user.
5. Admin access denial for a user account.
6. Admin completion of an order and revenue/count update.

Keep test data isolated with seeded records or unique markers, and use environment variables for credentials rather than committing them.
