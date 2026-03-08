# Test API Endpoints

## Authentication

### Register Admin User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@store.com","password":"password123","role":"admin"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

## Products

### Create Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "MILK-001",
    "barcode": "1234567890123",
    "name": "Whole Milk 1L",
    "description": "Fresh whole milk",
    "category_id": 1,
    "cost_price": 1.20,
    "selling_price": 1.99,
    "tax_rate": 0,
    "is_perishable": true,
    "is_weighed": false,
    "reorder_level": 20
  }'
```

### Get All Products
```bash
curl http://localhost:3001/api/products
```

### Search Products
```bash
curl "http://localhost:3001/api/products?search=milk"
```

### Get Product by Barcode
```bash
curl http://localhost:3001/api/products/barcode/1234567890123
```

### Update Product
```bash
curl -X PUT http://localhost:3001/api/products/{product_id} \
  -H "Content-Type: application/json" \
  -d '{"selling_price": 2.49}'
```

### Adjust Stock
```bash
curl -X POST http://localhost:3001/api/products/{product_id}/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50, "reason": "Initial stock"}'
```

### Delete Product (Soft Delete)
```bash
curl -X DELETE http://localhost:3001/api/products/{product_id}
```
