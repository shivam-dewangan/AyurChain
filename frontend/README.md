# AyurChain - Ayurvedic Herb Traceability

AyurChain is a comprehensive supply chain traceability platform for Ayurvedic herbs, providing complete transparency from farm to consumer.

## 🌿 Features

### Multi-Stakeholder Platform
- **Farmers**: Create and manage herb batches with complete traceability
- **Admins**: Approve farmers and verify batch quality
- **Companies**: Purchase verified herbs with transparent pricing and detailed batch information
- **Consumers**: Verify product authenticity and view complete journey

### Complete Traceability
- **Batch Creation**: Farmers record harvest details, farming conditions, and quality metrics
- **Status Tracking**: Real-time status updates with timeline progression
- **Document Management**: Land proof, certifications, and purity reports
- **Secure Records**: Immutable transaction records

### 🔔 Real-time Notifications & Purchase Tracking
- **Instant Notifications**: Farmers receive real-time notifications when companies purchase their batches
- **Detailed Purchase History**: Complete sales history with buyer information
- **Company Details**: Full company information including name, address, GST number, and contact details
- **Earnings Tracking**: Clear breakdown of farmer earnings (80%) and platform fees (20%)
- **Live Updates**: Real-time synchronization across all dashboards

### 🌙 Dark Mode & Enhanced UX
- **Dark Mode Toggle**: System-aware theme switching with manual override
- **PDF Export**: Generate detailed sales history reports
- **Advanced Search & Filters**: Powerful filtering by status, date, quantity, and more
- **Real-time Theme Sync**: Theme preferences saved across sessions

### 📱 QR Code System
- **QR Code Generation**: Automatic QR code creation for each batch
- **Download & Print**: Export QR codes as PNG files or print labels
- **QR Scanner**: Built-in camera scanner for batch verification
- **Mobile Verification**: Scan QR codes to instantly verify batch authenticity
- **URL Sharing**: Copy verification URLs for easy sharing

### 🗺️ Location & Mapping
- **Farm Location Maps**: Interactive maps showing exact farm locations
- **Address Verification**: Complete farm address display with map integration
- **External Map Links**: Direct links to Google Maps and OpenStreetMap
- **Visual Farm Context**: Companies can see where herbs are grown

### 👤 Profile Management
- **Comprehensive Profiles**: Complete farmer and company profile management
- **Editable Information**: Update all profile details directly from dashboard
- **Profile Dropdown**: Quick access to user information and editing
- **Role-specific Fields**: Customized fields for farmers vs companies

### 📋 Batch Details & Verification
- **Complete Batch Information**: Detailed view of all batch data
- **Farmer Profile Integration**: Full farmer details in batch information
- **Quality Metrics**: Moisture content, purity levels, and quality grades
- **Secure Verification**: Immutable batch records with unique identifiers

### Advanced Features
- **Real-time Updates**: Live status synchronization across all dashboards
- **Payment Distribution**: Automated 80/20 split (farmer/platform)
- **Timeline Tracking**: Complete audit trail of all changes
- **Inventory Management**: Track available and sold quantities

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Theme System**: next-themes for dark/light mode
- **PDF Generation**: jsPDF for sales reports
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth with RLS
- **State Management**: React Query
- **Routing**: React Router v6
- **Notifications**: Real-time WebSocket subscriptions

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ayurchain
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. **Database Setup**
Run the setup SQL in Supabase Dashboard:
```bash
# Copy and paste fix-notifications.sql in Supabase SQL Editor
# This creates all tables including the new notifications system
```

5. **Start Development Server**
```bash
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User management with roles (farmer/admin/company/consumer)
- **farmer_details**: Complete farmer profile and farm information
- **company_details**: Company registration data
- **batches**: Herb batch tracking with unique identifiers
- **purchases**: Transaction records with payment splits
- **notifications**: Real-time notification system for farmers

### User Roles
- `farmer`: Creates and manages herb batches, receives purchase notifications
- `admin`: Approves farmers and batches
- `company`: Purchases approved herbs, details shared with farmers
- `consumer`: Verifies product authenticity

## 🔔 Notification System

### How It Works
1. **Purchase Trigger**: When a company purchases a batch, a database trigger automatically creates a notification
2. **Real-time Delivery**: Farmers receive instant notifications via WebSocket subscriptions
3. **Rich Data**: Notifications include company details, purchase amount, and farmer earnings
4. **Persistent Storage**: All notifications are stored and can be viewed later

### Notification Features
- **Notification Bell**: Shows unread notification count in farmer dashboard
- **Purchase Details**: Complete buyer information including company name and contact details
- **Earnings Breakdown**: Clear display of total amount, farmer share (80%), and platform fee (20%)
- **Mark as Read**: Ability to mark notifications as read
- **Real-time Updates**: Instant delivery without page refresh

## 🔐 Authentication & Security

- **Row Level Security (RLS)**: Database-level access control
- **Role-based Access**: Different permissions per user type
- **Secure Notifications**: Users can only see their own notifications
- **Data Privacy**: Company details shared only with relevant farmers

## 🌐 Application Routes

### Public Routes
- `/` - Landing page with platform overview
- `/auth` - Login/signup with role selection
- `/verify` - Product verification and complete batch information

### Protected Routes
- `/farmer` - Farmer dashboard with batch management and notifications
- `/farmer/profile` - Complete farmer profile setup
- `/farmer/create-batch` - Create new herb batches
- `/farmer/batch/:id` - Edit batch information
- `/admin` - Admin dashboard for approvals
- `/company` - Company marketplace for purchasing

## 📊 Workflow

### 1. Farmer Registration
- Complete KYC with land proof documents
- Admin verification and approval
- Profile completion with farm details

### 2. Batch Creation
- Record harvest details and farming conditions
- Upload quality reports and product images
- Generate unique batch numbers
- Secure transaction recording

### 3. Status Management
- Real-time status updates with timeline tracking
- Status progression: Pending → Approved → Ready for Sale → Sold
- Complete change audit trail

### 4. Company Purchase
- Browse approved herb batches
- Transparent pricing and farmer information
- Automated payment distribution (80% farmer, 20% platform)

### 5. Consumer Verification
- QR code scanning for authenticity
- Complete traceability from farm to shelf
- Farmer profile and batch history access

## 📊 Enhanced Farmer Dashboard

### My Batches Tab
- View and manage all herb batches
- Real-time status updates
- Batch timeline tracking
- Status management controls

### Sales History Tab
- Complete purchase history
- Detailed buyer information
- Earnings breakdown
- Company contact details
- Purchase date and batch information

### Notification System
- Bell icon with unread count
- Dropdown with recent notifications
- Purchase details in notifications
- Mark as read functionality

## 🔧 Key Components

### NotificationBell
- Real-time notification display
- Unread count badge
- Purchase details popup
- Mark as read functionality

### PurchasesList
- Complete sales history
- Buyer information display
- Earnings breakdown
- Company details modal

### SearchFilters
- Advanced search functionality
- Multi-criteria filtering
- Real-time filter application
- Active filter display

### ThemeToggle
- Dark/light mode switching
- System preference detection
- Persistent theme storage
- Smooth transitions

### PDF Export
- Sales history reports
- Detailed transaction data
- Professional formatting
- Automatic file naming

### Real-time Subscriptions
- Live purchase notifications
- Automatic data synchronization
- WebSocket-based updates

## 📱 Mobile Responsive

- **Mobile-first Design**: Optimized for all screen sizes
- **Touch-friendly Interface**: Easy navigation on mobile devices
- **Responsive Notifications**: Notification system works on all devices
- **Adaptive Layouts**: Seamless experience across platforms

## 🚀 Deployment

1. **Build for production**
```bash
npm run build
```

2. **Deploy to hosting platform**
- Vercel, Netlify, or any static hosting
- Configure environment variables
- Set up custom domain (optional)

3. **Database Setup**
- Run `fix-notifications.sql` in Supabase Dashboard
- Verify all tables and triggers are created

## 🔄 Real-time Features

- **Purchase Notifications**: Instant alerts when batches are purchased
- **Live Status Updates**: Real-time batch status changes
- **Automatic Refresh**: Data synchronization without manual refresh
- **WebSocket Integration**: Persistent real-time connections

## 📈 Scalability

- **UUID primary keys** for unique identification
- **Efficient indexing** on frequently queried fields
- **Optimized queries** with selective field fetching
- **Horizontal scaling ready** architecture

## 🛡️ Security Features

- **Input validation** with Zod schemas
- **SQL injection protection** via Supabase RLS
- **XSS prevention** with React's built-in protections
- **Secure document handling** with URL-based storage

## 📞 Support

For technical support or questions:
- Check the documentation in `/docs` folder
- Review database schema in `/supabase/migrations`
- Contact development team for assistance

## 🎯 Recent Updates

### v3.0 - Complete Traceability & Verification
- ✅ **QR Code System**: Full QR generation, download, print, and scanning
- ✅ **Camera Scanner**: Built-in QR code scanner with pattern recognition
- ✅ **Batch Details Modal**: Comprehensive batch and farmer information view
- ✅ **Farm Location Maps**: Interactive maps with external map integration
- ✅ **Profile Management**: Complete profile editing with dropdown access
- ✅ **Enhanced Verification**: Detailed batch verification with all stakeholder info

### v2.1 - Enhanced UX & Features
- ✅ **Dark Mode**: Complete theme switching with system detection
- ✅ **PDF Export**: Sales history reports with detailed breakdowns
- ✅ **Advanced Search**: Multi-criteria filtering for batches and purchases
- ✅ **Enhanced Filters**: Date range, quantity, status, and text search
- ✅ **Theme Persistence**: User preferences saved across sessions
- ✅ **Responsive Design**: Dark mode works seamlessly on all devices

### v2.0 - Notification System
- ✅ Real-time purchase notifications for farmers
- ✅ Complete buyer information display
- ✅ Sales history with detailed purchase tracking
- ✅ Earnings breakdown and transparency
- ✅ WebSocket-based real-time updates
- ✅ Mobile-responsive notification system

## 🔧 Key Components

### QRScanner
- **Camera Integration**: Access device camera for QR scanning
- **Pattern Recognition**: Detect QR finder patterns in real-time
- **Batch Extraction**: Extract batch numbers from verification URLs
- **Error Handling**: Graceful fallback for camera access issues

### BatchDetailsModal
- **Complete Information**: All batch and farmer details in one view
- **QR Code Integration**: Direct QR code display with action buttons
- **Farm Location Maps**: Interactive map showing farm location
- **Download Options**: QR download, print, copy URL, and external links

### ProfileDropdown
- **User Information**: Complete profile display in header dropdown
- **Edit Functionality**: Direct profile editing from dropdown
- **Role-specific Fields**: Different fields for farmers vs companies
- **Real-time Updates**: Immediate profile updates across application

### FarmLocationMap
- **Interactive Maps**: OpenStreetMap integration for farm locations
- **External Links**: Direct links to Google Maps and OpenStreetMap
- **Address Display**: Complete farm address with map overlay
- **Mobile Responsive**: Works seamlessly on all devices

## 📱 Mobile Features

- **QR Code Scanning**: Camera-based QR scanning on mobile devices
- **Touch-friendly Interface**: Optimized for mobile interaction
- **Responsive Maps**: Mobile-optimized map viewing
- **Profile Management**: Easy profile editing on mobile
- **Real-time Notifications**: Push notifications on mobile browsers

## 🔐 Security & Privacy

- **Camera Permissions**: Secure camera access for QR scanning
- **Data Encryption**: All sensitive data encrypted in transit
- **Role-based Access**: Strict access control based on user roles
- **Profile Privacy**: Users control their own profile information
- **Secure QR Codes**: QR codes contain verification URLs, not sensitive data

## 📞 Support

For technical support or questions:
- Check the database setup files for schema information
- Review component documentation for implementation details
- Test QR scanning functionality with generated QR codes
- Contact development team for assistance

---

**AyurChain v3.0** - Complete transparency in Ayurvedic supply chain with QR verification, location mapping, comprehensive profiles, and real-time traceability.