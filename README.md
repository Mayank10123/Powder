# Prowider Mini Lead Distribution System

A full-stack lead generation and distribution system that automatically assigns service inquiries to providers based on predefined business rules and fair allocation logic.

## Features

✅ **Automatic Lead Allocation** - Leads assigned to 3 providers per mandatory rules
✅ **Fair Distribution** - Round-robin allocation ensures fair provider selection
✅ **Real-Time Dashboard** - Providers see assigned leads instantly (polling-based)
✅ **Webhook Idempotency** - Safe quota reset with duplicate prevention
✅ **Concurrency Handling** - Handles simultaneous lead creation safely
✅ **Database Persistence** - All allocation state stored in PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14 (React 18, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Polling-based updates (every 2 seconds)
- **Testing**: Built-in test tools panel

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd Powder
npm install
```

2. **Configure database connection**
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your PostgreSQL connection
DATABASE_URL="postgresql://username:password@localhost:5432/prowider"
```

3. **Set up database**
```bash
# Create tables
npx prisma db push

# Seed initial data (3 services, 8 providers)
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## System Architecture

### Allocation Algorithm

See [ALLOCATION_ALGORITHM.md](./ALLOCATION_ALGORITHM.md) for detailed explanation.

**Quick Summary:**
- Service 1 → Provider 1 (mandatory) + 2 from pool [2,3,4]
- Service 2 → Provider 5 (mandatory) + 2 from pool [6,7,8]
- Service 3 → Providers 1 & 4 (mandatory) + 1 from pool [2,3,5,6,7,8]

### Database Schema

#### Services
- id, name (3 services pre-seeded)

#### Providers
- id, name, email
- monthlyQuota (default: 10)
- leadsReceivedCount (current month)
- Round-robin indices for each service

#### Leads
- id, phoneNumber, name, city, description, serviceId
- **Unique constraint**: (phoneNumber, serviceId) - prevents duplicates

#### ProviderAssignments
- Tracks lead-to-provider assignments
- **Unique constraint**: (leadId, providerId) - prevents double assignment

#### QuotaResets
- Tracks webhook calls for idempotency
- webhookId as unique key

#### LeadAssignmentEvents
- Real-time event log for dashboard updates

## API Endpoints

### POST /api/leads
Create a new service request (lead)

**Request:**
```json
{
  "name": "John Doe",
  "phoneNumber": "5551234567",
  "city": "San Francisco",
  "serviceId": 1,
  "description": "Need help with..."
}
```

**Response:**
```json
{
  "success": true,
  "lead": { ... },
  "allocation": {
    "leadId": "...",
    "assignedProviders": [1, 2, 3],
    "mandatoryProviders": [1],
    "fairProviders": [2, 3]
  }
}
```

**Errors:**
- 409: Duplicate lead (same phone + service)
- 503: Allocation failed (insufficient quota)

### GET /api/leads
Fetch leads (optionally filtered)

**Query Parameters:**
- `serviceId`: Filter by service
- `providerId`: Filter by provider assignment

### GET /api/providers
Get all providers with their quota and assignments

**Query Parameters:**
- `id`: Get specific provider details

### POST /api/webhook/quota-reset
Reset provider quota (webhook endpoint)

**Headers:**
- `X-Webhook-Id`: Required for idempotency

**Request:**
```json
{
  "providerId": 1  // Optional - if omitted, resets all
}
```

**Idempotency:** Same X-Webhook-Id will not process twice

### GET /api/events
Get real-time assignment events

**Query Parameters:**
- `since`: ISO timestamp
- `providerId`: Filter by provider

## Pages

### `/` - Landing Page
Overview and quick links to other pages

### `/request-service`
Public customer form to submit service requests

### `/dashboard`
Provider dashboard showing:
- Current quota status
- Leads received count
- List of assigned leads
- Real-time updates (polls every 2 seconds)

### `/test-tools`
Testing panel with buttons for:
- Reset single provider quota
- Reset all provider quotas
- Test webhook idempotency
- Generate 10 leads concurrently
- Test duplicate prevention

## How It Works

### 1. Lead Submission Flow
```
Customer submits form → Validate data → Check for duplicates
→ Create lead → Trigger allocation → Assign to 3 providers
→ Update quota counts → Log events → Return result
```

### 2. Fair Allocation
```
Identify mandatory providers for service
Check if they have quota available
Select additional providers from fair pool using round-robin
Update round-robin indices for next allocation
Persist all assignments to database
```

### 3. Real-Time Updates
```
Dashboard polls /api/providers every 2 seconds
New assignments fetch latest provider data
UI updates to show new leads
Green indicator shows sync is active
```

### 4. Webhook Idempotency
```
Receive webhook call with X-Webhook-Id
Check if webhookId already processed in QuotaReset table
If exists: return success without action (idempotent)
If new: process quota reset and record webhookId
```

## Testing

The system includes comprehensive testing tools:

1. **Duplicate Prevention**
   - Try creating two leads with same phone + service
   - Second should be rejected

2. **Quota Limits**
   - Reset provider quota to 10
   - Create more than 10 leads for that provider
   - Should fail at 10 and prevent over-quota

3. **Fair Distribution**
   - Create many leads for same service
   - Check if providers are selected fairly (round-robin)
   - Same provider shouldn't get all leads

4. **Concurrency**
   - Use "Generate 10 Leads" button
   - All should be created successfully
   - Quota should be accurately incremented
   - No race conditions

5. **Idempotency**
   - Use "Test Webhook Idempotency" button
   - Same webhook ID called twice
   - Quota should only reset once

6. **Real-time Sync**
   - Keep dashboard open
   - Submit new lead in another tab
   - Dashboard should update within 2 seconds

## Concurrency & Race Conditions

### How Race Conditions Are Prevented

1. **Database Unique Constraints**
   - (phoneNumber, serviceId): Prevents duplicate leads
   - (leadId, providerId): Prevents double assignment
   - webhookId: Prevents duplicate quota resets

2. **Atomic Operations**
   - Lead creation + allocation done in single transaction context
   - Quota increment done immediately after assignment

3. **Round-Robin State**
   - Stored in database, not memory
   - Updated atomically with each allocation

4. **Provider Selection**
   - Quota check happens before assignment
   - If provider hits quota mid-allocation, fails early
   - All assignments rolled back if any fails

## Deployment

### Using Docker (Recommended)

```bash
docker-compose up
```

### Manual Deployment to Vercel

```bash
vercel deploy
```

Note: Ensure `DATABASE_URL` environment variable is set in Vercel dashboard

### Manual Deployment to any Node host

```bash
npm run build
npm start
```

## Troubleshooting

**"Cannot connect to database"**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env.local
- Ensure database exists

**"Allocation failed: mandatory providers are at quota"**
- Some providers have hit their 10-lead monthly limit
- Reset quotas in test tools or wait for month reset

**"Duplicate lead" error**
- You've already submitted a request with this phone + service
- Change phone number or service type

**Real-time updates not working**
- Check browser console for fetch errors
- Ensure /api/providers endpoint is accessible
- Try refreshing the dashboard

## Architecture Decisions

### Why Round-Robin Over Random?
- Ensures fair distribution over time
- Predictable and testable
- No provider repeatedly favored
- State persists across restarts

### Why Polling Over WebSocket?
- Simpler to implement and maintain
- Easier to deploy on serverless
- Works in more environments
- 2-second polling acceptable for typical lead times

### Why PostgreSQL Over MongoDB?
- Relational data (services → leads → providers)
- Strong consistency guarantees
- Built-in constraint enforcement (unique, foreign keys)
- Better for transaction handling

## File Structure

```
/app
  /api
    /leads/route.ts          - Lead CRUD
    /providers/route.ts      - Provider info
    /events/route.ts         - Real-time events
    /webhook
      /quota-reset/route.ts  - Webhook endpoint
  /dashboard/page.tsx         - Provider dashboard
  /request-service/page.tsx   - Customer form
  /test-tools/page.tsx        - Testing panel
  /layout.tsx                 - App layout
  /page.tsx                   - Home page
  /globals.css                - Global styles

/lib
  /allocation.ts              - Core allocation logic

/prisma
  /schema.prisma              - Database schema
  /seed.js                    - Initial data seed
```

## Performance Considerations

- Allocation: O(n) where n = number of providers (small constant)
- Round-robin indices: O(1) atomic increment
- Quota checks: O(1) direct lookup
- Lead query: Indexed by (phoneNumber, serviceId)
- Event polling: Limited to 100 recent events

All operations should complete in <100ms even under load

## License

Internal Use

## Support

Contact: support@prowider.com
