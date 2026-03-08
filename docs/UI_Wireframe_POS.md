# POS UI Wireframe & Component Structure

**Tech:** Next.js + Tailwind CSS
**Resolution:** Optimized for 1920x1080 (Desktop) and 1024x768 (Tablet/Touch POS)

## 1. Structural Layout (Grids)

The screen is divided into two main columns:

```jsx
<div className="h-screen w-full flex bg-gray-100">
  {/* LEFT PANEL: Product Catalog (65%) */}
  <div className="w-[65%] flex flex-col p-4 gap-4">
    <TopBar />       {/* Search & Categories */}
    <ProductGrid />  {/* Scrollable list of items */}
  </div>

  {/* RIGHT PANEL: Current Transaction (35%) */}
  <div className="w-[35%] bg-white shadow-xl flex flex-col border-l border-gray-300">
    <CartHeader />   {/* Customer Info (optional) */}
    <CartGeneric />  {/* Scrollable List of Items */}
    <CartTotals />   {/* Subtotal, Tax, Final Amount */}
    <ActionPad />    {/* BIG Pay Button, Void, Discount */}
  </div>
</div>
```

## 2. Component Details

### A. TopBar (`<TopBar />`)
*   **Search Input:** `w-full h-12 text-lg rounded-lg border-2 border-primary focus:ring-4`
    *   *Behavior:* Auto-focus on load. Listens to barcode scanner input (debounced).
*   **Category Pills:** Horizontal scroll loop of categories (e.g., "Veg", "Dairy").

### B. Product Grid (`<ProductGrid />`)
*   **Grid:** `grid grid-cols-4 gap-3`
*   **Card:** 
    ```jsx
    <div className="bg-white p-4 rounded shadow hover:bg-blue-50 cursor-pointer transition">
      <p className="font-bold text-gray-800">Milk 1L</p>
      <p className="text-secondary font-mono">$1.50</p>
    </div>
    ```

### C. Cart List (`<CartGeneric />`)
*   **Table Layout:** Name | Qty | Price | Delete Icon
*   **Active Row:** Highlighted in blue to show which item is being modified.
*   **Qty Control:** `[ - ] [ 1 ] [ + ]` buttons for touch users.

### D. Action Pad (`<ActionPad />`)
*   **Primary Button:** `bg-green-600 h-20 text-3xl font-bold text-white w-full rounded hover:bg-green-700` ("PAY $15.00")
*   **Secondary Actions:** Grid of 2x2.
    *   `Void Line` (Red)
    *   `Discount` (Orange)
    *   `Hold Bill` (Blue)
    *   `Refund Mode` (Gray)

## 3. Interaction Design
1.  **Scanner Input:** Global event listener captures keyboard input ending in `Enter` as a barcode scan.
2.  **Sound:** Success "Beep" on scan, "Buzz" on error (not found).
3.  **Keyboard Shortcuts:**
    *   `F1`: Pay Cash
    *   `F2`: Pay Card
    *   `Delete`: Remove selected item
    *   `Esc`: Clear search
