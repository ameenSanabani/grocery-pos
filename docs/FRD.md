# Functional Requirements Document (FRD)

## 1. Introduction
The Grocery Management System is a comprehensive solution designed to streamline the operations of a retail grocery store. It covers Point of Sale (POS), Inventory management, and Supplier procurement.

## 2. User Roles & Permissions
*   **Admin/Store Owner:** Full system access. Manage users, view all reports, adjust global settings.
*   **Store Manager:** Manage inventory, suppliers, and view shift reports. Cannot change system configs.
*   **Cashier:** Process sales, view stock lookups, process returns (with approval).

## 3. Key Modules & Features

### 3.1 Inventory Management
*   **SKU & Product Management:** 
    *   System must support auto-generated SKUs and custom barcodes.
    *   Support for loose items (weighed) and packaged items.
    *   **Perishables:** Track expiry dates. Alert system 7 days (configurable) before expiry.
*   **Stock Tracking:**
    *   Real-time stock deduction upon sale.
    *   **Auto-Reorder:** Flag products falling below min-level threshold.
*   **Tax/VAT:**
    *   Configurable tax rates per category (e.g., Essentials 0%, General 15%).
    *   Prices displayed inclusive or exclusive of tax based on config.

### 3.2 Point of Sale (POS)
*   **Checkout Process:**
    *   Scan barcode (USB/Bluetooth scanner support).
    *   Manual entry via search (name, SKU).
    *   "Quick Keys" for high-frequency non-barcoded items (e.g., Produce).
*   **Cart Operations:**
    *   Hold/Suspend transaction.
    *   Void item (requires permission).
    *   Apply line-item or global discount.
*   **Payments:**
    *   Multi-tender support (Split payment: Cash + Card).
    *   Integrated payment terminal support (optional future scope).
*   **Receipts:**
    *   Thermal print output with store logo, tax breakdown, and footer policy.

### 3.3 Supplier & Purchasing
*   **Purchase Orders (PO):**
    *   Generate POs based on low stock alerts.
    *   Track PO status: Draft -> Sent -> Partial Receive -> Completed.
*   **GRN (Goods Received Note):**
    *   Verify incoming stock against PO.
    *   Update stock levels and moving average cost.

## 4. Non-Functional Requirements (NFR)
### 4.1 Performance
*   **Scan-to-Cart:** < 200ms response time.
*   **Checkout Completion:** < 2 seconds for payment processing logic.
*   **Offline Mode:** POS must function 100% without internet, syncing data when online.

### 4.2 Security
*   **Data Protection:** Customer PII (if any) and Staff data encrypted at rest.
*   **Access Control:** Strict RBAC.
*   **Audit Logs:** All sensitive actions (voids, huge discounts, stock adjustments) must be logged.

### 4.3 Data Integrity
*   **ACID Compliance:** Sales transactions must be atomic.
*   **Backup:** Daily automated backups to cloud/external storage.

## 5. Assumptions & Constraints
*   Hardware: Standard PC/Tablet + ESC/POS Printer + Handheld Scanner.
*   OS: Web-based, running on Browser (Chrome/Edge).
