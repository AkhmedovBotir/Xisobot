# Backend API - Admin Management System

Backend API built with Node.js, Express, MongoDB, and JavaScript for managing admin users, dealers (dillerlar), sellers (sotuvchilar), payment transactions, and Telegram bots integration.

## Features

### Admin Management
- ✅ Admin authentication with JWT
- ✅ Two admin types: General and SuperAdmin
- ✅ Admin login and profile management
- ✅ Protected routes with middleware
- ✅ Script to create General admin

### Dealer Management (Dillerlar)
- ✅ CRUD operations for dealers
- ✅ Auto-increment tartib raqami (D1, D2, D3...)
- ✅ Search and filter functionality
- ✅ Status management (active/inactive)
- ✅ Telegram bot integration for dealers

### Seller Management (Sotuvchilar)
- ✅ CRUD operations for sellers
- ✅ Auto-increment tartib raqami (S1, S2, S3...)
- ✅ Search and filter functionality
- ✅ Status management (active/inactive)
- ✅ Multiple dealers assignment
- ✅ Telegram bot integration for sellers

### Payment Transactions
- ✅ Payment transactions from Telegram group scraping
- ✅ Payment transactions API (GET, GET by ID)
- ✅ Statistics and summary endpoints
- ✅ Transaction linking to sellers
- ✅ Filtering and pagination

### Admin Statistics & Dashboard
- ✅ Detailed statistics API with filtering
- ✅ Aggregated numbers statistics API
- ✅ Dashboard API with overall and period-based statistics
- ✅ Excel export functionality with customizable formatting
- ✅ Export progress tracking
- ✅ One-time download with auto-deletion

### Configuration Management
- ✅ Percentage (foiz) configuration API
- ✅ Configurable percentage for statistics calculations

### Telegram Bots
- ✅ Group scraping bot for payment transactions
- ✅ Diller (Dealer) Telegram bot with registration
- ✅ Diller can manage their Sotuvchilar via Telegram
- ✅ Sotuvchi (Seller) Telegram bot with order management
- ✅ Statistics viewing in bots
- ✅ Period-based statistics (today, yesterday, weekly, monthly)
- ✅ Multi-transaction selection for phone numbers

## Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-telegram-bot-api** - Telegram Bot API
- **exceljs** - Excel file generation
- **dotenv** - Environment variables management

## Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin_db
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
TELEGRAM_BOT_TOKEN=your-group-scraping-bot-token
DILLER_BOT_TOKEN=your-diller-bot-token
SOTUVCHI_BOT_TOKEN=your-sotuvchi-bot-token
```

5. Make sure MongoDB is running

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Creating General Admin

Create a General admin using the provided script:

```bash
npm run create-admin
```

Or with custom credentials:
```bash
npm run create-admin <username> <email> <password>
```

**Default credentials (if not provided):**
- Username: `general_admin`
- Email: `general@admin.com`
- Password: `admin123`

## API Endpoints

### Public Endpoints

- `POST /api/admin/login` - Admin login
- `GET /api/health` - Health check

### Protected Endpoints

#### Admin Management
- `GET /api/admin` - Get all admins (SuperAdmin only)
- `GET /api/admin/me` - Get current admin info

#### Admin Statistics
- `GET /api/admin/dashboard` - Get dashboard statistics (overall, period-based, key metrics, latest transactions)
- `GET /api/admin/statistika` - Get detailed statistics with filtering
- `GET /api/admin/statistika/raqamlar` - Get aggregated numbers statistics
- `GET /api/admin/statistika/export` - Export statistics to Excel
- `GET /api/admin/statistika/export/status/:exportId` - Get export status
- `GET /api/admin/statistika/export/download/:filename` - Download exported Excel file

#### Configuration
- `GET /api/admin/config/foiz` - Get percentage configuration
- `PUT /api/admin/config/foiz` - Update percentage configuration

#### Dillerlar (Dealers)
- `GET /api/diller` - Get all dillerlar (with filters and search)
- `GET /api/diller/:id` - Get single diller
- `POST /api/diller` - Create new diller
- `PUT /api/diller/:id` - Update diller
- `DELETE /api/diller/:id` - Delete diller

#### Sotuvchilar (Sellers)
- `GET /api/sotuvchi` - Get all sotuvchilar (with filters and search)
- `GET /api/sotuvchi/:id` - Get single sotuvchi
- `POST /api/sotuvchi` - Create new sotuvchi
- `PUT /api/sotuvchi/:id` - Update sotuvchi
- `DELETE /api/sotuvchi/:id` - Delete sotuvchi

#### Payment Transactions
- `GET /api/payments` - Get all payment transactions (with filters and pagination)
- `GET /api/payments/:id` - Get single payment transaction
- `GET /api/payments/stats/summary` - Get payment statistics summary

## Detailed API Documentation

For detailed API documentation with request/response examples, please refer to:

- **Dillerlar API**: [API_DOCUMENTATION_DILLER.md](./API_DOCUMENTATION_DILLER.md)
- **Sotuvchilar API**: [API_DOCUMENTATION_SOTUVCHI.md](./API_DOCUMENTATION_SOTUVCHI.md)
- **Payment Transactions API**: [API_DOCUMENTATION_PAYMENTS.md](./API_DOCUMENTATION_PAYMENTS.md)
- **Admin Statistics API**: [API_DOCUMENTATION_ADMIN_STATISTIKA.md](./API_DOCUMENTATION_ADMIN_STATISTIKA.md)
- **Admin Dashboard API**: [API_DOCUMENTATION_ADMIN_DASHBOARD.md](./API_DOCUMENTATION_ADMIN_DASHBOARD.md)
- **Admin Excel Export API**: [API_DOCUMENTATION_ADMIN_EXPORT.md](./API_DOCUMENTATION_ADMIN_EXPORT.md)
- **Admin Foiz Configuration API**: [API_DOCUMENTATION_ADMIN_FOIZ_CONFIG.md](./API_DOCUMENTATION_ADMIN_FOIZ_CONFIG.md)

## Project Structure

```
Backend/
├── config/
│   └── database.js              # MongoDB connection configuration
├── bots/
│   ├── group-scraping/
│   │   ├── bot.js               # Group scraping bot for payment transactions
│   │   ├── parser.js            # Message parser for transaction data
│   │   └── commands.js          # Bot commands
│   ├── diller/
│   │   ├── bot.js               # Diller (Dealer) Telegram bot
│   │   ├── stateManager.js      # State management for bot interactions
│   │   └── keyboards.js         # Keyboard layouts
│   └── sotuvchi/
│       ├── bot.js               # Sotuvchi (Seller) Telegram bot
│       ├── stateManager.js      # State management for bot interactions
│       └── keyboards.js         # Keyboard layouts
├── controllers/
│   ├── adminController.js       # Admin business logic (statistics, dashboard, export, config)
│   ├── dillerController.js      # Diller business logic
│   ├── sotuvchiController.js    # Sotuvchi business logic
│   └── paymentController.js     # Payment transactions logic
├── middleware/
│   └── auth.js                  # Authentication & authorization middleware
├── models/
│   ├── Admin.js                 # Admin model
│   ├── Diller.js                # Diller (Dealer) model
│   ├── Sotuvchi.js              # Sotuvchi (Seller) model
│   ├── PaymentTransaction.js    # Payment transaction model
│   └── Config.js                # Configuration model
├── routes/
│   ├── adminRoutes.js           # Admin routes
│   ├── dillerRoutes.js          # Diller routes
│   ├── sotuvchiRoutes.js        # Sotuvchi routes
│   └── paymentRoutes.js         # Payment routes
├── scripts/
│   └── createGeneralAdmin.js    # Script to create General admin
├── uploads/                     # Directory for exported Excel files
├── .env.example                 # Environment variables example
├── .gitignore
├── package.json
├── server.js                    # Main server file
└── README.md
```

## Telegram Bots

### Group Scraping Bot
The group scraping bot automatically reads payment messages from Telegram groups, parses them, and stores transaction data in MongoDB. The bot starts automatically when the server starts.

**Features:**
- Automatic message monitoring in configured Telegram groups
- Payment transaction parsing
- Data storage in MongoDB
- Duplicate message prevention

### Diller Bot
The Diller (Dealer) bot allows dealers to register, manage their sellers, view orders and statistics through Telegram.

**Features:**
- Registration via Telegram
- View orders from their sellers
- View statistics (today, yesterday, weekly, monthly)
- Manage sellers (view assigned sellers)

### Sotuvchi Bot
The Sotuvchi (Seller) bot allows sellers to manage orders, view statistics, and link transactions through Telegram.

**Features:**
- Registration via Telegram
- Add orders by phone number
- View orders (with dealer filtering)
- View statistics (today, yesterday, weekly, monthly)
- Multi-transaction selection for phone numbers
- Link transactions to seller account

## Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token, login using the `/api/admin/login` endpoint.

## Statistics & Dashboard

The system provides comprehensive statistics and dashboard functionality:

### Dashboard API
Provides overall statistics, period-based statistics (today, yesterday, weekly, monthly), key metrics (total/active dealers/sellers, new transactions in 24 hours), and latest transactions list.

### Statistics API
Detailed statistics with filtering capabilities:
- Date filtering (specific date or date range)
- Phone number filtering
- Dealer filtering
- Seller filtering
- Pagination support

### Excel Export
Export statistics to Excel with:
- Customizable formatting
- Filter information in header
- Summary rows (OPEN summa, Umumiy summa, Percentage)
- Progress tracking
- One-time download with auto-deletion

### Configuration
Percentage configuration can be managed via API to customize the percentage calculation in statistics and Excel exports.

## Payment Transactions

Payment transactions are automatically scraped from Telegram groups and stored in the database. Transactions can be:
- Linked to sellers
- Filtered by various criteria
- Viewed through API or Telegram bots
- Included in statistics and exports

## Workflow Example

1. **Create Admin**: Use the script to create an admin account
2. **Login**: Login to get JWT token
3. **Create Dealers**: Create dealer accounts via API
4. **Create Sellers**: Create seller accounts and assign to dealers
5. **Telegram Bots**: Dealers and sellers register via Telegram bots
6. **Payment Transactions**: Transactions are automatically scraped from Telegram groups
7. **Link Transactions**: Sellers link transactions to their accounts via Telegram bot
8. **View Statistics**: View statistics via API or Telegram bots
9. **Export Data**: Export statistics to Excel for analysis

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a `success: false` flag and an error message.

## Environment Variables

Required environment variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration (default: 7d)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for group scraping
- `DILLER_BOT_TOKEN` - Telegram bot token for Diller bot
- `SOTUVCHI_BOT_TOKEN` - Telegram bot token for Sotuvchi bot

## License

ISC
