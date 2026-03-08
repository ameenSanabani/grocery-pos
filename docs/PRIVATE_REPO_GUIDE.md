# Private Repository Guide

Features and modules that should be moved to a **private repository** (or private npm packages) to prevent easy replication of your grocery POS app.

## High-Value Modules to Privatize

These modules contain your most differentiated business logic:

### 1. Analytics Engine
| File | Purpose |
|---|---|
| `server/src/services/analytics.service.ts` | Revenue, profit, and trend calculations |
| `server/src/controllers/analytics.controller.ts` | Analytics API endpoints |
| `server/src/routes/analytics.routes.ts` | Analytics route definitions |
| `client/src/app/analytics/page.tsx` | Analytics dashboard UI |
| `client/src/store/useAnalyticsStore.ts` | Analytics state management |

### 2. Bulk Import System
| File | Purpose |
|---|---|
| `server/src/controllers/bulkImport.controller.ts` | Excel/barcode bulk import logic |
| `client/src/components/procurement/BulkImportModal.tsx` | Import UI |

### 3. Refund & Credit System
| File | Purpose |
|---|---|
| `server/src/services/refund.service.ts` | Refund logic (receipt, manual, store credit) |
| `client/src/app/refunds/page.tsx` | Refund page UI |

### 4. Procurement & Purchase Orders
| File | Purpose |
|---|---|
| `server/src/services/purchase.service.ts` | Purchase order + stock receiving |
| `server/src/controllers/purchase.controller.ts` | Purchase API |
| `client/src/components/procurement/PurchaseOrderModal.tsx` | PO creation UI |
| `client/src/components/procurement/ReceiveStockModal.tsx` | Stock receiving UI |
| `client/src/components/procurement/POInvoice.tsx` | PO invoice |

---

## How to Extract

### Option A: Monorepo with Private Packages (Recommended)
1. Create a private GitHub repo: `grocery-pos-pro`
2. Move the modules above into the private repo as an npm package
3. In your public repo, declare them as dependencies in `package.json`
4. Authenticate with a GitHub Personal Access Token to install them

### Option B: Split into Public + Private Repos
1. Keep `auth`, `product`, `category`, `supplier`, `customer`, `settings`, `shift` public
2. Move everything in the list above to the private repo
3. The public repo shows the app skeleton; the private repo completes it

---

## What to Keep Public

> **⚠️ Shift & Cash Management must stay public.** The POS requires an open shift/cash box before any sale can be processed. Moving shifts to a private repo would make the app unusable — nobody can even enter the POS without opening a shift.

These modules are core dependencies and are safe to keep in the public repo:
- Authentication (`auth.service.ts`, `auth.controller.ts`)
- **Shift Management** (`shift.service.ts`, `shift.controller.ts`, `ShiftGate.tsx`, etc.) — required for POS entry
- Products (`product.service.ts`, `product.controller.ts`)
- Categories, Suppliers, Customers (basic CRUD)
- Settings (store profile, user preferences)
- UI components (`Button.tsx`, `Card.tsx`, `Input.tsx`, `Sidebar.tsx`)
