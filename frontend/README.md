# PropertyPal

A mobile-first Expo React Native application for smart property management.

## Features

### Part 1 - Authentication & Core UI
- Full Light and Dark theme support
- Mock authentication system with persistent login
- Animated splash screen
- Bottom tab navigation
- Profile management with theme toggle
- Modern, clean UI design

### Part 2A - Property Creation Wizard
- 5-step wizard for creating properties
  - Step 1: Property Details (name, type, city)
  - Step 2: Buildings (add/edit/remove buildings)
  - Step 3: Floors (add/edit/remove floors per building)
  - Step 4: Rooms (add/remove rooms with share types)
  - Step 5: Review (review complete property hierarchy before submission)
- Multi-building support with floor management
- Room management with share type selection (Single, Double, Triple)
- Visual bed preview based on share type
- Real-time validation with inline feedback
- Persistent wizard state across steps
- Smooth animations and transitions
- Card-based layouts with touch-friendly UI

### Part 2B-2B - Review Screen
- Comprehensive review screen showing complete property hierarchy
- Collapsible cards for Buildings, Floors, and Rooms
- Beds displayed as simple list with availability status
- Summary statistics showing:
  - Total Buildings
  - Total Floors
  - Total Rooms
  - Total Beds
- Property details summary at top
- Navigation back to edit previous steps
- Read-only display with no editing capabilities

### Part 2B-2C - Final Validation & Save
- Complete validation before saving:
  - Every building must have at least 1 floor
  - Every floor must have at least 1 room
  - Every room must have at least 1 bed
- Inline validation messages for any errors
- "Confirm & Save" button disabled when validation fails
- Success feedback with animated check icon
- Automatic navigation to Properties list after save
- Full wizard state reset after successful save
- Properties persisted in AsyncStorage via propertiesStore
- Properties list displays saved properties with complete stats

### Part 3A - Dashboard Analytics
- Real-time analytics computed from local properties store
- Key metrics displayed:
  - Total Properties
  - Total Buildings
  - Total Floors
  - Total Rooms
  - Total Beds
  - Available Beds
- Occupancy Rate indicator with animated progress bar
- Color-coded occupancy status (green/yellow/red based on percentage)
- Empty state with CTA to create first property
- Smooth entrance animations for all dashboard cards
- Reusable StatCard and OccupancyIndicator components
- Mobile-optimized grid layout
- Dashboard is the default screen after login

### Part 3B - Property Details & Bed Status
- Property Details screen accessible from Properties list
- Shows property name, type, and city at the top
- Read-only property hierarchy view:
  - Expandable buildings
  - Expandable floors within buildings
  - Expandable rooms within floors
  - Bed status display within rooms
- Bed status color coding:
  - Green = Available
  - Red = Occupied
- Room-level summary showing:
  - Room number and share type
  - Total bed count
  - Available vs Occupied beds count
- Summary statistics at property level:
  - Total buildings
  - Available beds (green)
  - Occupied beds (red)
- Clean nested card layout with subtle animations
- Touch-friendly expandable/collapsible hierarchy
- Back navigation to Properties list
- Reusable components: BuildingAccordion, FloorAccordion, RoomDetailCard, BedStatusBadge

### Part 4 - Members Management (Foundation)
- Members tab in bottom navigation
- Members list screen displaying all members
- Each member card shows:
  - Name
  - Phone number
  - Active status
- Add member functionality:
  - Name field (required)
  - Phone number field (required)
  - Success feedback on save
- Remove member functionality:
  - Confirmation dialog before removal
  - Smooth removal animation
- Empty state with CTA to add first member
- Members persisted in AsyncStorage via membersStore
- Reusable components: MemberCard, MemberForm
- No bed assignments yet (foundation for future features)

## Tech Stack

- Expo + React Native
- TypeScript
- expo-router for navigation
- Zustand for state management
- react-native-reanimated for animations
- AsyncStorage for persistence

## Project Structure

```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx (Dashboard)
│   ├── properties.tsx
│   ├── members.tsx
│   └── profile.tsx
├── property/
│   ├── _layout.tsx
│   └── [id].tsx (Property Details)
├── member/
│   ├── _layout.tsx
│   └── add.tsx (Add Member)
├── wizard/
│   ├── _layout.tsx
│   ├── property-details.tsx
│   ├── buildings.tsx
│   ├── floors.tsx
│   ├── rooms.tsx
│   └── review.tsx
├── _layout.tsx
└── index.tsx (Splash)

components/
├── AnimatedButton.tsx
├── PropertyCard.tsx
├── FloorCard.tsx
├── RoomCard.tsx
├── RoomDetailCard.tsx
├── ShareTypeSelector.tsx
├── WizardHeader.tsx
├── WizardFooter.tsx
├── ReviewSummary.tsx
├── TotalStatsCard.tsx
├── HierarchyCard.tsx
├── BuildingAccordion.tsx
├── FloorAccordion.tsx
├── BedStatusBadge.tsx
├── StatCard.tsx
├── OccupancyIndicator.tsx
├── MemberCard.tsx
└── MemberForm.tsx

store/
├── useStore.ts
├── useWizardStore.ts
├── usePropertiesStore.ts
└── useMembersStore.ts

theme/
├── colors.ts
└── useTheme.ts

types/
├── property.ts
└── member.ts

mockData/
└── users.ts
```

## Demo Credentials

- Email: demo@propertypal.com
- Password: demo123

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for web:
   ```bash
   npm run build:web
   ```

## Deploy to GitHub Pages (/docs)

This project is configured to export static web files into the `docs/` folder for GitHub Pages.

1. Ensure the base path matches your repo name:
  - Update `expo.web.publicPath` and `expo.experiments.baseUrl` in `app.json` to `/<repo-name>/` and `/<repo-name>`.
  - It is currently set to `/sample/`.
2. Build the web export:
  ```bash
  npm run build:web
  ```
3. Commit and push the `docs/` folder to `main`.
4. In GitHub repo settings, set Pages Source to the `/docs` folder on the `main` branch.

## Theme System

The app supports Light and Dark themes with the following colors:

### Light Theme
- Primary: hsl(173, 58%, 39%)
- Secondary: hsl(220, 14%, 96%)
- Accent: hsl(12, 76%, 61%)
- Background: #ffffff
- Text: #111827

### Dark Theme
- Primary: hsl(173, 58%, 45%)
- Secondary: hsl(220, 20%, 18%)
- Accent: hsl(12, 76%, 55%)
- Background: #0f172a
- Text: #f8fafc

Theme preference is persisted in AsyncStorage and can be toggled from the Profile screen.

## Authentication

Mock authentication is implemented using Zustand and AsyncStorage:
- Login with demo credentials or create a new account
- Auth state persists across app restarts
- Logout clears auth state and redirects to login

## Property Creation Wizard

The app includes a comprehensive 5-step wizard for creating properties:

### Step 1: Property Details
- Enter property name (required)
- Select property type (Hostel, PG, Apartment)
- Enter city location

### Step 2: Buildings
- Add multiple buildings to the property
- Edit or remove existing buildings
- At least one building required to proceed
- Buildings are initialized with empty floors array

### Step 3: Floors
- Building selector tabs with floor counts
- Add floors to each building with custom labels (e.g., G, 1, 2)
- Edit or remove floors per building
- Validation ensures all buildings have at least one floor
- Visual indicators for buildings missing floors

### Step 4: Rooms
- Building and floor selector tabs
- Add rooms with room number and share type
- Share type options: Single (1 bed), Double (2 beds), Triple (3 beds)
- Visual bed icon preview based on selected share type
- Remove rooms per floor
- Validation ensures all floors have at least one room
- Room count indicators per floor

### Step 5: Review & Save
- Comprehensive review of complete property hierarchy
- Collapsible cards for buildings, floors, and rooms
- Total statistics summary (buildings, floors, rooms, beds)
- Final validation ensures all requirements are met
- "Confirm & Save" button with accent color
- Success feedback upon save
- Automatic navigation to Properties list

All wizard data is persisted in AsyncStorage and survives app restarts.

## Data Model

```typescript
type ShareType = 'single' | 'double' | 'triple';

interface Room {
  id: string;
  roomNumber: string;
  shareType: ShareType;
}

interface Floor {
  id: string;
  label: string;
  rooms: Room[];
}

interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

interface Property {
  id: string;
  name: string;
  type: 'Hostel' | 'PG' | 'Apartment';
  city: string;
  buildings: Building[];
  totalRooms: number;
  totalBeds: number;
  createdAt: string;
}
```

## Coming Soon

- Bed assignment functionality
- Member assignment to beds
- Payment tracking
- Maintenance requests
- And more...
