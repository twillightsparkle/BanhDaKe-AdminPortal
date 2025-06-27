# Admin Portal - BanhdakeShop

A comprehensive admin interface for managing the BanhdakeShop e-commerce platform. This portal provides complete control over products, orders, and inventory management.

## Features

### ✅ Authentication
- Secure admin login with predefined credentials
- Session persistence using localStorage
- Protected routes ensuring only authenticated admins can access the portal

### ✅ Dashboard
- Overview statistics (total products, orders, revenue)
- Low stock alerts
- Recent orders preview
- Quick access to all management sections

### ✅ Product Management
- **Add Products**: Create new products with images, descriptions, pricing, and stock
- **Manage Products**: View all products in a responsive grid layout
- **Edit Products**: Update product information through modal forms
- **Delete Products**: Remove products with confirmation dialogs
- **Search & Filter**: Find products quickly with search functionality

### ✅ Order Management
- View all customer orders in a comprehensive table
- Filter orders by status (Pending, Shipped, Completed)
- Search orders by ID, customer name, or email
- Update order status with dropdown selectors
- View detailed customer information and order items

### ✅ Stock Management
- Monitor inventory levels for all products
- Low stock warnings (configurable threshold)
- Quick stock adjustments (+1, +10, -1)
- Bulk stock editing capabilities
- Visual indicators for stock levels

## Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router DOM
- **Styling**: Custom CSS with modern design principles
- **State Management**: React Context API
- **Build Tool**: Vite

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.tsx        # Authentication component
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Navbar.tsx       # Navigation component
│   ├── AddProduct.tsx   # Product creation form
│   ├── ManageProducts.tsx # Product management grid
│   ├── Orders.tsx       # Order management table
│   └── StockManagement.tsx # Inventory management
├── contexts/
│   └── AdminContext.tsx # Global state management
├── types/
│   └── index.ts         # TypeScript type definitions
├── assets/              # Static assets
├── App.tsx              # Main application component
├── App.css              # Global styles
└── main.tsx             # Application entry point
```

## Key Features Details

### Authentication System
- Mock authentication with hardcoded credentials (easily replaceable with real auth)
- Automatic redirect handling for authenticated/unauthenticated users
- Session persistence across browser sessions

### Product Management
- Complete CRUD operations for products
- Image upload support (URL-based)
- Rich product descriptions with short and long variants
- Real-time stock tracking
- Responsive grid layout for product display

### Order Processing
- Comprehensive order status management
- Customer information display
- Multi-product order support
- Date-based order tracking
- Status-based filtering and organization

### Inventory Control
- Real-time stock level monitoring
- Automated low stock alerts
- Quick adjustment tools for rapid inventory changes
- Bulk editing capabilities
- Visual stock status indicators

## Responsive Design

The admin portal is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

- Integration with backend APIs
- Advanced analytics and reporting
- Bulk product import/export
- User role management
- Email notifications for low stock
- Order fulfillment tracking
- Customer communication tools

## Security Notes

In a production environment, ensure:
- Use secure authentication methods (JWT, OAuth, etc.)
- Implement proper API security
- Use HTTPS for all communications
- Store sensitive data securely
- Implement rate limiting and input validation
