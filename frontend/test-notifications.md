# Testing the Notification System

## Setup Instructions

1. **Run the SQL setup in Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the content from `setup-notifications.sql`
   - Run the SQL to create the notifications table and triggers

2. **Test the Flow:**
   - Login as a farmer and create a batch
   - Set the batch status to "ready_for_sale"
   - Login as a company and purchase the batch
   - Switch back to farmer account
   - Check the notification bell (should show a red badge)
   - Click on notifications to see purchase details
   - Go to "Sales History" tab to see detailed purchase information

## Features Implemented

### For Farmers:
- **Notification Bell**: Shows unread notification count
- **Real-time Notifications**: Automatically receives notifications when batches are purchased
- **Purchase Details**: Complete buyer information including company name, contact details
- **Sales History Tab**: Dedicated section showing all sales with buyer details
- **Earnings Tracking**: Clear display of farmer earnings (80% of total amount)

### For Companies:
- **Company Profile Integration**: Shows company name in dashboard
- **Purchase Process**: Maintains existing purchase flow
- **Buyer Information**: Company details are properly stored and shared with farmers

### Real-time Features:
- **Live Notifications**: Farmers get instant notifications when purchases happen
- **Auto-refresh**: Purchase history updates automatically
- **Notification Management**: Mark as read functionality

## Database Changes:
- Added `notifications` table with proper RLS policies
- Created trigger to auto-generate notifications on purchase
- Added indexes for performance optimization

## UI Components Added:
- `NotificationBell.tsx`: Bell icon with notification count and dropdown
- `PurchasesList.tsx`: Detailed sales history with buyer information
- Updated `FarmerDashboard.tsx` with tabs and notification integration

The system now provides complete transparency - when a company purchases a batch, the farmer immediately knows who bought it and can see all their contact and company details.