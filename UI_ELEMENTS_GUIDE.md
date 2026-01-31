# Complete UI Elements Guide for Alhaad Admin Application

## Application Overview
**Base URL**: http://localhost:3000  
**Login Credentials**:
- Email: admin@admin.com
- Password: admin

**Technology Stack**: React + Material-UI + Redux + React Router

---

## 1. AUTHENTICATION PAGES

### 1.1 Login Page
**Route**: `/login`  
**UI Elements**:
- **Language Selector** (dropdown)
  - Flag icons for different countries
  - Language options dropdown
- **Email Input** (text field)
  - Placeholder: Email address
  - Persisted in localStorage
- **Password Input** (text field)
  - Placeholder: Password
  - Show/hide password toggle button (eye icon)
- **2FA Code Input** (text field, conditional)
  - Appears if TOTP is enabled
- **Remember Me** (checkbox)
- **Login Button** (primary button)
- **Forgot Password** (link) - navigates to `/reset-password`
- **Register** (link, conditional) - navigates to `/register`
- **QR Code Button** (icon button) - shows QR code for authentication
- **Change Server** (icon button) - navigates to `/change-server`
- **OpenID Login Button** (conditional)
- **Announcement Snackbar** (conditional)

### 1.2 Register Page
**Route**: `/register`  
**UI Elements**:
- **Name Input** (text field)
- **Email Input** (text field)
- **Password Input** (text field)
- **Register Button** (primary button)
- **Back to Login** (link)

### 1.3 Reset Password Page
**Route**: `/reset-password`  
**UI Elements**:
- **Email Input** (text field)
- **Reset Button** (primary button)
- **Back to Login** (link)

### 1.4 Change Server Page
**Route**: `/change-server`  
**UI Elements**:
- **Server URL Input** (text field)
- **Change Button** (primary button)
- **Back Button** (button)

---

## 2. MAIN DASHBOARD

### 2.1 Main Page (Map View)
**Route**: `/` (home/index)  
**Main Sections**:

#### Top Toolbar
- **Map/List Toggle Button** (icon button)
  - DnsIcon (list view)
  - MapIcon (map view)
- **Search Devices Input** (text field)
  - Placeholder: "Search Devices"
  - Auto-complete dropdown with device suggestions
- **Filter Button** (icon button with badge)
  - Opens filter popover
  - Badge shows active filters

#### Filter Popover
- **Status Checkboxes**:
  - Online
  - Offline
  - Unknown
- **Group Selection** (multi-select dropdown)
- **Sort Options** (dropdown):
  - Name
  - Last Update
- **Map Filter Toggle** (checkbox)
  - "Show on Map Only"

#### Device List Panel (Left Sidebar)
- **Device Rows** (list items):
  - Device name
  - Status indicator (colored dot)
  - Last update time
  - Battery indicator
  - Speed indicator
  - Address/location
  - Click to select device

#### Map View (Main Area)
- **Interactive Map** (MapLibre GL)
- **Device Markers**:
  - Colored by status
  - Direction arrows
  - Click to show details
- **Geofences** (polygons/circles)
- **Route Path** (polyline)
- **Current Location Button** (floating action button)
- **Zoom Controls**
- **Scale Indicator**
- **Geocoder Search** (search box on map)

#### Events Drawer (Right Side)
- **Events List**
- **Event Cards**:
  - Event type
  - Device name
  - Timestamp
  - Description

#### Bottom Menu (Mobile/Desktop)
- **Map** (navigation item)
- **Reports** (navigation item)
- **Settings** (navigation item)
- **Account Menu** (navigation item)
  - Account Settings
  - Logout

---

## 3. SETTINGS PAGES

### 3.1 Settings Menu (Sidebar)
**Common Navigation Items**:
- Preferences
- Users (admin only)
- Server (admin only)
- Notifications
- Groups
- Drivers
- Calendars
- Computed Attributes
- Saved Commands
- Maintenance
- Devices
- Geofences (link to geofences page)
- Announcement (admin only)

---

### 3.2 Users Page
**Route**: `/settings/users`  
**UI Elements**:
- **Search Bar** (text input)
- **Users Table**:
  - **Columns**:
    - Name
    - Email
    - Admin (yes/no)
    - Disabled (yes/no)
    - Expiration Time
    - Actions
  - **Action Buttons** (per row):
    - Edit (pencil icon)
    - Delete (trash icon)
    - Login As (login icon, admin only)
    - Connections (link icon)
- **Add User Button** (floating action button, bottom right)
- **Show Temporary Users** (toggle switch, bottom)

---

### 3.3 User Page (Add/Edit)
**Route**: `/settings/user/:id` or `/settings/user` (new)  
**UI Elements**:
- **Required Fields**:
  - Name (text field)
  - Email (text field)
  - Password (text field, new user only)
- **Optional Fields**:
  - Phone (text field)
  - Admin (checkbox)
  - Disabled (checkbox)
  - Readonly (checkbox)
  - Device Readonly (checkbox)
  - Limit Commands (checkbox)
  - Disable Reports (checkbox)
  - Expiration Time (date picker)
- **Attributes** (accordion):
  - Key-value pairs
  - Add/Remove attribute buttons
- **Save Button** (primary button)
- **Cancel Button** (secondary button)

---

### 3.4 Devices Page
**Route**: `/settings/devices`  
**UI Elements**:
- **Search Bar** (text input)
- **Devices Table**:
  - **Columns**:
    - Name
    - Identifier (unique ID)
    - Group
    - Phone
    - Model
    - Contact
    - Expiration Time
    - Address
    - Users (admin only)
    - Actions
  - **Action Buttons** (per row):
    - Edit (pencil icon)
    - Delete (trash icon)
    - Connections (link icon)
- **Add Device Button** (floating action button)
- **Export Button** (bottom left)
- **Show All Devices Toggle** (bottom right, admin only)

---

### 3.5 Device Page (Add/Edit)
**Route**: `/settings/device/:id` or `/settings/device` (new)  
**UI Elements**:
- **Required Information Card**:
  - Name (text field)
  - Identifier/Unique ID (text field)
  - Category (dropdown):
    - Car, Motorcycle, Bicycle, Person, etc.
- **Optional Information Card**:
  - Group (dropdown/autocomplete)
  - Phone (text field)
  - Model (text field)
  - Contact (text field)
  - Disabled (checkbox)
- **Device Image Upload**:
  - File input
  - Image preview
- **QR Code Button** (shows device QR code)
- **Attributes Accordion**:
  - Device-specific attributes
  - Key-value pairs
- **Connections Tab** (if editing):
  - Link to users/groups/geofences
- **Save Button** (primary button)
- **Cancel Button** (secondary button)

---

### 3.6 Groups Page
**Route**: `/settings/groups`  
**UI Elements**:
- **Search Bar** (text input)
- **Groups Table**:
  - **Columns**:
    - Name
    - Actions
  - **Action Buttons** (per row):
    - Edit (pencil icon)
    - Delete (trash icon)
    - Connections (link icon)
    - Send Command (publish icon)
- **Add Group Button** (floating action button)

---

### 3.7 Group Page (Add/Edit)
**Route**: `/settings/group/:id` or `/settings/group` (new)  
**UI Elements**:
- **Name** (text field)
- **Group ID** (text field, optional)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.8 Geofences Page
**Route**: `/geofences`  
**UI Elements**:
- **Top Toolbar**:
  - Back button
  - Title: "Geofences"
  - Upload GPX button (file upload)
- **Geofences List** (left panel):
  - List of all geofences
  - Click to select
  - Edit/Delete actions
- **Map View** (main area):
  - Interactive map
  - Geofence drawing tools:
    - Circle
    - Polygon
    - Line
  - Edit mode for selected geofence
- **Current Location Button**
- **Geocoder Search**

---

### 3.9 Geofence Page (Add/Edit)
**Route**: `/settings/geofence/:id` or `/settings/geofence` (new)  
**UI Elements**:
- **Name** (text field)
- **Description** (text field)
- **Calendar** (dropdown)
- **Area** (text field, WKT format)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.10 Notifications Page
**Route**: `/settings/notifications`  
**UI Elements**:
- **Search Bar**
- **Notifications Table**:
  - **Columns**:
    - Description
    - Type
    - Always
    - Alarms
    - Notificators
    - Actions
  - **Action Buttons**:
    - Edit
    - Delete
- **Add Notification Button**

---

### 3.11 Notification Page (Add/Edit)
**Route**: `/settings/notification/:id` or `/settings/notification` (new)  
**UI Elements**:
- **Description** (text field)
- **Type** (dropdown):
  - Device Online/Offline
  - Device Moving/Stopped
  - Geofence Enter/Exit
  - Alarm
  - Ignition On/Off
  - Maintenance
  - Speed Limit
  - etc.
- **Always** (checkbox)
- **Notificators** (multi-select):
  - Web
  - Mail
  - SMS
  - Firebase
- **Alarms** (multi-select, conditional)
- **Calendar** (dropdown)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.12 Drivers Page
**Route**: `/settings/drivers`  
**UI Elements**:
- **Search Bar**
- **Drivers Table**:
  - Name
  - Unique ID
  - Actions
- **Add Driver Button**

---

### 3.13 Driver Page (Add/Edit)
**Route**: `/settings/driver/:id` or `/settings/driver` (new)  
**UI Elements**:
- **Name** (text field)
- **Unique ID** (text field)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.14 Calendars Page
**Route**: `/settings/calendars`  
**UI Elements**:
- **Search Bar**
- **Calendars Table**:
  - Name
  - Actions
- **Add Calendar Button**

---

### 3.15 Calendar Page (Add/Edit)
**Route**: `/settings/calendar/:id` or `/settings/calendar` (new)  
**UI Elements**:
- **Name** (text field)
- **Calendar Data** (file upload, .ics format)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.16 Computed Attributes Page
**Route**: `/settings/attributes`  
**UI Elements**:
- **Search Bar**
- **Attributes Table**:
  - Description
  - Attribute
  - Expression
  - Type
  - Actions
- **Add Attribute Button**

---

### 3.17 Computed Attribute Page (Add/Edit)
**Route**: `/settings/attribute/:id` or `/settings/attribute` (new)  
**UI Elements**:
- **Description** (text field)
- **Attribute** (text field)
- **Expression** (text field, code input)
- **Type** (dropdown):
  - String, Number, Boolean
- **Save Button**
- **Cancel Button**

---

### 3.18 Commands Page
**Route**: `/settings/commands`  
**UI Elements**:
- **Search Bar**
- **Commands Table**:
  - Description
  - Type
  - Actions
- **Add Command Button**

---

### 3.19 Command Page (Add/Edit)
**Route**: `/settings/command/:id` or `/settings/command` (new)  
**UI Elements**:
- **Description** (text field)
- **Type** (dropdown):
  - Custom
  - Position Single
  - Position Periodic
  - Output Control
  - Engine Stop
  - Engine Resume
  - etc.
- **Attributes** (dynamic based on type)
- **Save Button**
- **Cancel Button**

---

### 3.20 Maintenance Page
**Route**: `/settings/maintenances`  
**UI Elements**:
- **Search Bar**
- **Maintenance Table**:
  - Name
  - Type
  - Start (value)
  - Period
  - Actions
- **Add Maintenance Button**

---

### 3.21 Maintenance Page (Add/Edit)
**Route**: `/settings/maintenance/:id` or `/settings/maintenance` (new)  
**UI Elements**:
- **Name** (text field)
- **Type** (dropdown):
  - Total Distance
  - Engine Hours
- **Start** (number input)
- **Period** (number input)
- **Attributes Accordion**
- **Save Button**
- **Cancel Button**

---

### 3.22 Server Page
**Route**: `/settings/server` (admin only)  
**UI Elements**:
- **Server Information**:
  - ID (read-only)
  - Registration (checkbox)
  - Readonly (checkbox)
  - Device Readonly (checkbox)
  - Limit Commands (checkbox)
  - Force Settings (checkbox)
  - Version (read-only)
- **Map Settings**:
  - Map URL (text field)
  - Coordinates Format (dropdown)
  - Speed Unit (dropdown)
  - Distance Unit (dropdown)
  - Volume Unit (dropdown)
- **Attributes Accordion**
- **Save Button**

---

### 3.23 Preferences Page
**Route**: `/settings/preferences`  
**UI Elements**:
- **User Preferences**:
  - Distance Unit (dropdown)
  - Speed Unit (dropdown)
  - Volume Unit (dropdown)
  - Timezone (dropdown)
  - Twelve Hour Format (checkbox)
  - Coordinates Format (dropdown)
- **Map Preferences**:
  - Map Layer (dropdown)
  - Active Map Follows (checkbox)
- **Attributes Accordion**
- **Save Button**

---

### 3.24 Announcement Page
**Route**: `/settings/announcement` (admin only)  
**UI Elements**:
- **Announcement Text** (text area)
- **Save Button**

---

### 3.25 Device Connections Page
**Route**: `/settings/device/:id/connections`  
**UI Elements**:
- **Users Tab**:
  - Available users list (checkboxes)
  - Save button
- **Groups Tab**:
  - Available groups list (checkboxes)
  - Save button
- **Geofences Tab**:
  - Available geofences list (checkboxes)
  - Save button
- **Notifications Tab**:
  - Available notifications list (checkboxes)
  - Save button
- **Drivers Tab**:
  - Available drivers list (checkboxes)
  - Save button
- **Computed Attributes Tab**
- **Saved Commands Tab**
- **Maintenance Tab**

---

### 3.26 Command Device Page
**Route**: `/settings/device/:id/command`  
**UI Elements**:
- **Command Selector** (dropdown)
- **Command Parameters** (dynamic based on selected command)
- **Send Button** (primary button)
- **Recent Commands List**

---

### 3.27 Command Group Page
**Route**: `/settings/group/:id/command`  
**UI Elements**:
- Same as Command Device Page

---

### 3.28 Share Page
**Route**: `/settings/device/:id/share`  
**UI Elements**:
- **Share Link** (text field, read-only)
- **Copy Button**
- **Expiration Time** (date picker)
- **Generate Button**

---

### 3.29 Accumulators Page
**Route**: `/settings/accumulators/:deviceId`  
**UI Elements**:
- **Total Distance** (number input)
- **Engine Hours** (number input)
- **Save Button**

---

### 3.30 User Connections Page
**Route**: `/settings/user/:id/connections`  
**UI Elements**:
- Same structure as Device Connections Page
- Tabs for: Devices, Groups, Geofences, Notifications, Calendars, Drivers, Attributes, Commands, Maintenance

---

### 3.31 Group Connections Page
**Route**: `/settings/group/:id/connections`  
**UI Elements**:
- Same structure as Device Connections Page

---

## 4. REPORTS PAGES

### 4.1 Reports Menu
**Common Navigation**:
- Combined
- Chart
- Route
- Events
- Trips
- Stops
- Summary
- Statistics
- Scheduled
- Audit
- Logs

---

### 4.2 Combined Report Page
**Route**: `/reports/combined`  
**UI Elements**:
- **Report Filter Panel**:
  - Device Selector (multi-select dropdown)
  - Group Selector (dropdown)
  - From Date/Time (date-time picker)
  - To Date/Time (date-time picker)
  - Show Button (primary button)
  - Export Button (secondary button)
  - Schedule Button (secondary button)
- **Map View** (top half)
- **Report Table** (bottom half):
  - Device
  - Time
  - Valid
  - Latitude/Longitude
  - Speed
  - Address
  - etc.
- **Column Selector** (dropdown, customizes visible columns)

---

### 4.3 Route Report (Positions) Page
**Route**: `/reports/route`  
**UI Elements**:
- **Report Filter Panel** (same as Combined)
- **Map View** with route path
- **Positions Table**:
  - Device
  - Time
  - Valid
  - Latitude/Longitude
  - Speed
  - Address
  - Attributes
- **Column Selector**
- **Export Button**
- **Schedule Button**

---

### 4.4 Events Report Page
**Route**: `/reports/events`  
**UI Elements**:
- **Report Filter Panel**:
  - Device Selector
  - Group Selector
  - Event Type Selector (dropdown)
  - From/To Date-Time
  - Show Button
- **Events Table**:
  - Device
  - Time
  - Type
  - Geofence (if applicable)
  - Maintenance (if applicable)
  - Alarm (if applicable)
  - Attributes
- **Export Button**
- **Schedule Button**

---

### 4.5 Trip Report Page
**Route**: `/reports/trips`  
**UI Elements**:
- **Report Filter Panel** (same as Combined)
- **Map View** (shows selected trip route)
- **Trips Table**:
  - Device
  - Start Time
  - Start Address
  - End Time
  - End Address
  - Distance
  - Average Speed
  - Max Speed
  - Duration
  - Spent Fuel
  - Driver
- **Column Selector**
- **Row Actions**:
  - Show on Map (GPS icon)
  - Show Route (route icon)
- **Export Button**
- **Schedule Button**

---

### 4.6 Stop Report Page
**Route**: `/reports/stops`  
**UI Elements**:
- **Report Filter Panel**
- **Map View**
- **Stops Table**:
  - Device
  - Start Time
  - End Time
  - Duration
  - Engine Hours
  - Address
  - Spent Fuel
- **Column Selector**
- **Export Button**
- **Schedule Button**

---

### 4.7 Summary Report Page
**Route**: `/reports/summary`  
**UI Elements**:
- **Report Filter Panel**
- **Summary Table**:
  - Device
  - Distance
  - Average Speed
  - Max Speed
  - Engine Hours
  - Spent Fuel
- **Column Selector**
- **Export Button**
- **Schedule Button**

---

### 4.8 Chart Report Page
**Route**: `/reports/chart`  
**UI Elements**:
- **Report Filter Panel**:
  - Device Selector (single)
  - Group Selector
  - Chart Type (dropdown):
    - Speed
    - Altitude
    - etc.
  - From/To Date-Time
  - Show Button
- **Chart Visualization** (Recharts):
  - Line chart
  - X-axis: Time
  - Y-axis: Selected metric
- **Export Button**

---

### 4.9 Statistics Page
**Route**: `/reports/statistics`  
**UI Elements**:
- **Date Range Selector**:
  - From Date
  - To Date
  - Show Button
- **Statistics Cards**:
  - Active Users
  - Active Devices
  - Messages Stored
  - Requests
- **Chart** (if available)

---

### 4.10 Scheduled Reports Page
**Route**: `/reports/scheduled`  
**UI Elements**:
- **Search Bar**
- **Scheduled Reports Table**:
  - Description
  - Type
  - Period (daily/weekly/monthly)
  - Actions
- **Add Scheduled Report Button**

---

### 4.11 Audit Page
**Route**: `/reports/audit` (admin only)  
**UI Elements**:
- **Report Filter Panel**:
  - User Selector
  - From/To Date-Time
  - Show Button
- **Audit Table**:
  - User
  - Time
  - Method (GET/POST/PUT/DELETE)
  - URI
  - Query
  - Success/Failure
- **Export Button**

---

### 4.12 Logs Page
**Route**: `/reports/logs` (admin only)  
**UI Elements**:
- **Report Filter Panel**:
  - From/To Date-Time
  - Show Button
- **Logs Table**:
  - Time
  - Log Level
  - Message
- **Export Button**

---

## 5. OTHER PAGES

### 5.1 Position Page
**Route**: `/position/:id`  
**UI Elements**:
- **Position Details Card**:
  - Device Name
  - Time
  - Valid (yes/no)
  - Latitude/Longitude
  - Speed
  - Course
  - Address
  - Accuracy
  - Network
- **Map View** (shows position)
- **Attributes Accordion** (all position attributes)
- **Back Button**

---

### 5.2 Network Page
**Route**: `/network/:positionId`  
**UI Elements**:
- **Network Information**:
  - Cell towers
  - WiFi networks
  - Signal strength
- **Map View** (shows network locations)
- **Back Button**

---

### 5.3 Event Page
**Route**: `/event/:id`  
**UI Elements**:
- **Event Details Card**:
  - Device Name
  - Time
  - Type
  - Geofence (if applicable)
  - Maintenance (if applicable)
  - Alarm (if applicable)
- **Attributes Accordion**
- **Map View** (if position available)
- **Back Button**

---

### 5.4 Replay Page
**Route**: `/replay`  
**UI Elements**:
- **Top Toolbar**:
  - Device Selector (dropdown)
  - From Date/Time (date-time picker)
  - To Date/Time (date-time picker)
  - Load Button
- **Map View** (main area):
  - Route path
  - Device marker (animated)
- **Playback Controls** (bottom):
  - Play/Pause button
  - Speed selector (1x, 2x, 5x, 10x)
  - Progress slider
  - Current position time display
- **Position Details Panel** (side):
  - Time
  - Speed
  - Address
  - Attributes

---

### 5.5 Emulator Page
**Route**: `/emulator` (admin only)  
**UI Elements**:
- **Device ID Input** (text field)
- **Latitude Input** (number)
- **Longitude Input** (number)
- **Speed Input** (number)
- **Course Input** (number)
- **Altitude Input** (number)
- **Send Position Button**
- **Map View** (shows emulated position)

---

## 6. COMMON UI COMPONENTS

### 6.1 Top App Bar (All Pages)
- **Logo** (left)
- **Page Title** (center)
- **User Menu** (right):
  - Username display
  - Account link
  - Logout button

### 6.2 Breadcrumbs (Settings/Reports Pages)
- Navigation trail
- Clickable links to parent pages

### 6.3 Floating Action Button (FAB)
- Appears on list pages
- "+" icon for adding new items
- Bottom right position

### 6.4 Confirmation Dialog
- Used for delete actions
- Title: "Confirm"
- Message: "Are you sure?"
- Cancel button
- Confirm button (red, danger color)

### 6.5 Snackbar Notifications
- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Auto-dismiss after 3-5 seconds

### 6.6 Loading Indicators
- Page loader (full screen, circular progress)
- Table shimmer (skeleton loading rows)
- Button loading state (spinner)

### 6.7 Status Indicators
- **Online**: Green dot
- **Offline**: Red dot
- **Unknown**: Gray dot

---

## 7. KEYBOARD SHORTCUTS & INTERACTIONS

### Map Interactions
- **Mouse wheel**: Zoom in/out
- **Click + Drag**: Pan map
- **Click marker**: Show device details
- **Double-click**: Zoom in

### Table Interactions
- **Click row**: Select/highlight (on some tables)
- **Hover row**: Show action buttons
- **Click column header**: Sort (where applicable)

### Search/Filter
- **Type in search**: Auto-filter results
- **Clear search**: Show all results

---

## 8. RESPONSIVE BEHAVIOR

### Desktop (>960px)
- Sidebar visible
- Map and list side-by-side
- Full navigation menu
- Bottom menu hidden

### Tablet (600px-960px)
- Collapsible sidebar
- Map/list toggle
- Condensed navigation

### Mobile (<600px)
- Full-screen views
- Bottom navigation bar
- Hamburger menu
- Map/list full screen toggle
- Swipe gestures

---

## 9. DATA FORMATS

### Date/Time Formats
- Default: YYYY-MM-DD HH:mm:ss
- Relative: "2 minutes ago", "1 hour ago"
- Date only: YYYY-MM-DD

### Distance Units
- Kilometers (km)
- Miles (mi)
- Nautical Miles (nmi)

### Speed Units
- km/h
- mph
- knots

### Coordinates Formats
- Decimal: 40.7128, -74.0060
- Degrees: 40°42'46.8"N 74°00'21.6"W
- Degrees/Minutes: 40°42.78'N 74°00.36'W

---

## 10. TESTING GUIDE FOR GEMINI

### Login Flow
```
1. Navigate to http://localhost:3000/login
2. Enter email: admin@admin.com
3. Enter password: admin
4. Click "Login" button
5. Verify redirect to home page (/)
```

### Device Management Flow
```
1. Navigate to http://localhost:3000/settings/devices
2. Verify devices table loads
3. Click "+" FAB to add device
4. Fill in required fields (Name, Unique ID)
5. Select category from dropdown
6. Click "Save" button
7. Verify device appears in table
```

### Report Generation Flow
```
1. Navigate to http://localhost:3000/reports/trips
2. Select device(s) from dropdown
3. Select date range (From/To)
4. Click "Show" button
5. Verify trips table populates
6. Verify map shows trip route
7. Click "Export" to download Excel
```

### Map Interaction Flow
```
1. Navigate to http://localhost:3000/
2. Verify map loads with device markers
3. Click on device marker
4. Verify device details appear
5. Click device in list
6. Verify map centers on device
7. Use zoom controls
8. Use search to filter devices
```

---

## 11. ELEMENT SELECTORS (for Automation)

### Common CSS Selectors
```css
/* Login Page */
input[type="email"]
input[type="password"]
button[type="submit"]

/* Main Dashboard */
.MuiOutlinedInput-root  /* Search input */
.MuiIconButton-root     /* Icon buttons */
.device-row             /* Device list items */

/* Tables */
.MuiTable-root
.MuiTableHead-root
.MuiTableBody-root
.MuiTableRow-root
.MuiTableCell-root

/* Buttons */
.MuiFab-root            /* Floating action button */
.MuiButton-contained    /* Primary buttons */
.MuiButton-outlined     /* Secondary buttons */

/* Forms */
.MuiTextField-root      /* Text inputs */
.MuiSelect-root         /* Dropdowns */
.MuiCheckbox-root       /* Checkboxes */
.MuiSwitch-root         /* Toggles */

/* Dialogs */
.MuiDialog-root
.MuiDialogTitle-root
.MuiDialogContent-root
.MuiDialogActions-root
```

### Common Test IDs (if implemented)
```
data-testid="login-email"
data-testid="login-password"
data-testid="login-submit"
data-testid="device-add-button"
data-testid="device-save-button"
```

---

## 12. API ENDPOINTS (Referenced in UI)

### Authentication
- `POST /api/session` - Login
- `DELETE /api/session` - Logout
- `GET /api/session` - Get current user

### Devices
- `GET /api/devices` - List devices
- `POST /api/devices` - Create device
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user

### Reports
- `GET /api/reports/trips` - Trip report
- `GET /api/reports/stops` - Stop report
- `GET /api/reports/summary` - Summary report
- `GET /api/reports/route` - Route data

### Positions
- `GET /api/positions` - Live positions
- WebSocket `/api/socket` - Real-time updates

---

## 13. STATE MANAGEMENT

### Redux Store Slices
- `session` - User session, server config
- `devices` - Device list and selection
- `groups` - Group list
- `geofences` - Geofence list
- `positions` - Real-time position data
- `errors` - Error messages

### Local Storage Keys
- `loginEmail` - Saved email
- `hostname` - Server hostname
- `showAllDevices` - Show all devices preference
- `filterSort` - Sort preference
- `tripColumns` - Selected columns for trip report

---

## SUMMARY

This guide covers **90+ routes** and **500+ UI elements** across:
- 4 authentication pages
- 1 main dashboard
- 30+ settings pages
- 12 report pages
- 5 other utility pages
- 7 common components

**Key Testing Areas for Gemini**:
1. Login/Authentication flows
2. Device CRUD operations
3. Report generation and filtering
4. Map interactions and device selection
5. User/Group/Geofence management
6. Real-time position updates
7. Notification configuration
8. Export functionality

Each page has been documented with:
- Exact route path
- All input fields and their types
- All buttons and their actions
- All interactive elements
- Table structures and columns
- Conditional UI elements
- Navigation flows

This documentation is ready for use with Gemini or any AI/automation tool to understand and interact with your application.
