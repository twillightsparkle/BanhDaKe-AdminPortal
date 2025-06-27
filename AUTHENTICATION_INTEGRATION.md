# Authentication Integration Guide

## Frontend (AdminPortal) Integration

The AdminPortal has been updated to use real backend authentication instead of mock credentials.

### Changes Made:

1. **API Configuration Updated:**
   - Added `/auth` endpoint to API_CONFIG
   - Enhanced apiRequest to automatically include Bearer tokens
   - Added automatic token cleanup on 401 errors

2. **Authentication Service Added:**
   ```typescript
   authService.login(username, password)   // Login admin
   authService.verify()                    // Verify token
   authService.register(...)               // Register new admin
   ```

3. **AdminContext Updated:**
   - Removed mock ADMIN_CREDENTIALS
   - Login function now async and calls backend API
   - Automatic token verification on app load
   - Proper token storage and cleanup

4. **Login Component Updated:**
   - Handles async login properly
   - Better error handling for network issues

### Usage:

**Default Admin Credentials:**
- Username: `admin`
- Email: `admin@banhdake.com`  
- Password: `admin123`

**Flow:**
1. User enters credentials in Admin Portal
2. AdminContext calls authService.login()
3. Backend validates and returns JWT token
4. Token stored in localStorage as 'adminToken'
5. All subsequent API calls include Bearer token
6. If token expires/invalid, user auto-logged out

### Security Features:

✅ **Real JWT Authentication:** No more mock credentials  
✅ **Automatic Token Inclusion:** All API requests include auth headers  
✅ **Token Verification:** Validates existing sessions on app load  
✅ **Auto Logout:** Clears invalid tokens and redirects to login  
✅ **Error Handling:** Proper feedback for auth failures  

### API Endpoints Protected:

**Products (Admin Only):**
- POST /api/products - Create product
- PUT /api/products/:id - Update product  
- PATCH /api/products/:id/stock - Update stock
- DELETE /api/products/:id - Delete product

**Orders (Admin Only):**
- GET /api/orders - View all orders
- GET /api/orders/:id - View single order
- PUT /api/orders/:id/status - Update order status
- DELETE /api/orders/:id - Delete order

**Public (No Auth Required):**
- GET /api/products - Browse products
- GET /api/products/:id - View product details
- POST /api/orders - Create customer orders

### Testing:

1. Start backend server: `npm start` (in backend folder)
2. Start admin portal: `npm run dev` (in AdminPortal folder)
3. Login with admin/admin123
4. Verify all admin functions work
5. Check browser dev tools - API calls should include Authorization headers

The system now provides enterprise-grade authentication while maintaining a smooth user experience for both customers and administrators.
