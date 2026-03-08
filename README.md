# 🛒 Grocery Point of Sale & Management System

A comprehensive, modern Point of Sale (POS) and inventory management system designed for grocery stores. Built with performance, scalability, and ease of use in mind.

## ✨ Key Features

### 🎯 Point of Sale (POS)
- **Fast Checkout**: Intuitive interface for rapid sales processing
- **Barcode Scanning**: Built-in barcode support with camera/scanner integration
- **Receipt Management**: Digital receipts with printable barcode references
- **Payment Methods**: Support for cash, credit cards, and store credit
- **Shift Management**: Cash register tracking and shift handover
- **Offline Support**: Continue operations during internet outages

### 📦 Inventory Management
- **Real-time Stock Tracking**: Automatic inventory updates with every sale
- **Product Management**: Categories, pricing, and SKU management
- **Bulk Barcode Import**: Upload `.xlsx`/`.csv` scanned lists to instantly populate inventory and automatically split multiple suppliers into distinct grouped Purchase Orders
- **Stock Alerts**: Low inventory notifications and reorder points
- **Supplier Management**: Vendor relationships and purchase orders
- **Stock Adjustments**: Manual adjustments and inventory audits

### 💳 Customer Management
- **Customer Database**: Store customer information and preferences
- **Store Credit System**: Customer accounts with credit tracking
- **Purchase History**: Complete transaction records for each customer
- **Credit Management**: Credit limits and payment tracking

### 🔄 Refunds & Returns
- **Quick Refund Processing**: Fast barcode-based receipt lookup
- **Refund Tracking**: Complete return history and reason codes
- **Inventory Restoration**: Automatic stock updates on returns
- **Customer Credit**: Refund to store credit or cash

### 📊 Analytics & Reporting
- **Sales Analytics**: Daily, weekly, and monthly sales reports
- **Product Performance**: Best-selling products and categories
- **Financial Reports**: Revenue, tax, and discount tracking
- **Shift Reports**: Cash register performance summaries

### 👥 User Management
- **Role-Based Access**: Admin, Manager, and Cashier roles
- **Secure Authentication**: JWT-based authentication system
- **User Permissions**: Granular access control features

## 🏗️ Technical Architecture

### Frontend (client/)
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with modern design patterns
- **State Management**: Zustand for efficient state handling
- **TypeScript**: Full TypeScript support for type safety
- **UI Components**: Custom component library with Lucide icons

### Backend (server/)
- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify for high-performance API
- **Database**: SQLite with better-sqlite3 for reliability
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schema validation
- **Testing**: Vitest for comprehensive unit testing

### Key Integrations
- **Barcode Generation**: JsBarcode for receipt barcodes
- **Date Handling**: Built-in date utilities
- **File Management**: Local file system for receipts
- **Environment**: Full environment configuration support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Grocery_Project
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The API will start on `http://localhost:3001`

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   The app will start on `http://localhost:3002`

4. **Create Admin User**
   ```bash
   cd ../server
   npm run create-admin
   ```
   Default credentials: `admin` / `password123`

## 📱 Usage

### First Time Setup
1. Create admin user using the create-admin script
2. Log in to the admin panel
3. Configure store settings (name, currency, etc.)
4. Add initial product inventory
5. Set up suppliers and categories

### Daily Operations
1. **Cashier Workflow**:
   - Start shift with opening balance
   - Process sales using barcode scanner or manual entry
   - Handle cash and credit transactions
   - Print receipts with barcodes
   - End shift with closing balance

2. **Manager Workflow**:
   - Monitor sales analytics
   - Manage inventory levels
   - Process refunds and returns
   - Handle customer accounts
   - Generate reports

### Barcode Usage
- **Sales**: Scan product barcodes for quick checkout
- **Receipts**: Each receipt includes a scannable barcode
- **Refunds**: Scan receipt barcodes for instant refund processing
- **Inventory**: Use barcode scanners for stock management

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests  
cd client
npm run test
```

## 📦 Production Deployment

### Environment Setup
1. Set environment variables in `.env` files
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx/Apache)

### Build Commands
```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build
```

### Database Setup
- Run database migrations
- Seed initial data
- Set up automated backups

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment (development/production)

### Store Settings
Configure through admin panel:
- Store name and address
- Currency and tax settings
- Receipt customization
- Payment methods

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📋 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Sales Endpoints
- `GET /sales` - List sales
- `POST /sales` - Create sale
- `GET /sales/receipt/:id` - Get sale by receipt
- `POST /sales/:id/refund` - Process refund

### Inventory Endpoints
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `GET /categories` - List categories

### Customer Endpoints
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer

## 🔄 Updates & Maintenance

### Database Maintenance
Two scripts are provided in the `server` directory to keep your database healthy and fast.

#### 1. Manual Backups
Create a safe snapshot of your database while the server is running.
```bash
cd server
npm run backup
```
- **Location**: Backups are saved to `server/backups/`.
- **Pruning**: Automatically keeps only the **5 most recent** backups to save disk space.

#### 2. Archiving & Shrinking
Move old sales history to an archive file and physically shrink the main database file.
```bash
cd server
# Default: Keep last 12 months of sales
npm run archive

# Custom: Keep last 3 months (aggressive shrinking)
npm run archive 3

# Custom: Keep last 2 years
npm run archive 24
```
- **Functionality**: Moves `sales` and `sale_items` older than the specified months to `server/archives/`.
- **Performance**: Runs `VACUUM` at the end to reclaim disk space and speed up the main system.
- **Safety**: Keeps your Products, Categories, and Customers intact in the main database.

### Database Migrations
Run migrations when updating:
```bash
cd server
npm run migrate
```

### Backup Strategy
- Regular database backups
- User data exports
- Configuration backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow coding standards

## 📝 License

This project is licensed under the PolyForm Noncommercial License 1.0.0 - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check documentation in `/docs`
- Review existing issues for solutions

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app version
- [ ] Cloud synchronization
- [ ] Advanced reporting dashboard
- [ ] Loyalty program integration
- [ ] E-commerce integration
- [ ] Multi-store support

### Recent Updates
- ✅ Bulk Barcode PO Import & Multi-Supplier Splitting
- ✅ Barcode receipt functionality
- ✅ Enhanced refund system
- ✅ Improved performance optimizations
- ✅ Production deployment ready

---

**Built with ❤️ for modern grocery management**