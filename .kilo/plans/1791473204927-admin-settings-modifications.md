# Admin Settings Page Modifications - Implementation Plan

## Objective
Modify the `/cai-dat` admin settings page with 4 key changes:
1. Remove Zalo Bot guide/notice section
2. Move License Key config to System Settings (or remove since it's at `/quan-ly-key`)
3. Add warranty period selection for inventory sales (3/6/12/36 months, default 12)
4. Implement customer care reminders at 1/6/12 months post-purchase via Zalo Bot to group

---

## Current State Analysis

### Settings Page Structure (`app/(admin)/cai-dat/page.tsx`)
- **Tab: `webhook_zalo`** (Zalo Bot config) - Lines 960-1252
  - Webhook URL configuration
  - Zalo Bot API Base URL
  - Chat ID configuration
  - Notification toggles (booking, order, ticket, key request, sale success)
  - Action buttons (test, set webhook, get info, delete)
  - **Guide section to REMOVE** (lines 1216-1236): "Hướng dẫn tạo Bot nhận thông báo tức thì"
- **Tab: `faqs`** - FAQ management
- **Tab: `reviews`** - Customer reviews
- **Tab: `security`** - Member management & password reset
- **Tab: `key-email`** - Links to `/quan-ly-key` for license key management

### SystemSettings Interface (`lib/store.tsx:58-96`)
```typescript
export interface SystemSettings {
  // ... existing fields ...
  botApiBaseUrl?: string;
  zaloDefaultChatId?: string;
  customWebhookUrl?: string;
  notifyOnNewBooking?: boolean;
  notifyOnNewOrder?: boolean;
  notifyOnNewTicket?: boolean;
  notifyOnKeyRequest?: boolean;
  notifyOnSaleSuccess?: boolean;
  // MISSING: warranty defaults for inventory sales
  // MISSING: customer care reminder settings
}
```

### Inventory Sales Flow
- `InventoryItem.warranty_months` exists in DB schema (default 12)
- `sellInventoryItem()` accepts `warrantyMonths` param
- "Tạo phiếu mới" page already has warranty quick-select: [1, 3, 6, 12, 36] months
- Service tickets track `warranty_duration_months`, `warranty_until`, `created_at`

### Zalo Bot Integration (`lib/server/zaloBot.ts`)
- `sendZaloBotMessage({ chatId, text, parseMode })` - sends to group/user
- Token & Secret read from env vars (secure, not in DB)
- `getZaloBotConfig()` reads `zaloDefaultChatId` from settings

### No Existing Scheduler
- No cron jobs, pg_cron, or scheduled functions for reminders

---

## Implementation Plan

### Phase 1: Settings Page UI Changes (`app/(admin)/cai-dat/page.tsx`)

#### Task 1.1: Remove Zalo Bot Guide Section
- **Location**: Lines 1216-1236 (amber box "Hướng dẫn tạo Bot nhận thông báo tức thì")
- **Action**: Delete the entire `<div className="p-3.5 bg-amber-50/70...">` block
- **Rationale**: Token/Secret already in env vars; guide is redundant

#### Task 1.2: Move/Remove License Key Config from Settings
- **Current**: Tab `key-email` (line 1441) links to `/quan-ly-key`
- **Action**: Remove `key-email` tab entirely (already accessible at `/quan-ly-key`)
- **Alternative**: Keep as link in System Settings if needed for discoverability

#### Task 1.3: Enhance System Settings Tab (Create New Tab or Extend Existing)
Need to add a **System Settings** tab (or extend `webhook_zalo` tab) with:

**New Settings Fields** (add to `SystemSettings` interface):
```typescript
// Warranty defaults for inventory sales
defaultWarrantyMonths?: number; // 3 | 6 | 12 | 36 (default: 12)

// Customer Care Reminders
enableCustomerCareReminders?: boolean;
customerCareReminderChatId?: string; // Zalo group Chat ID for reminders
customerCareReminderIntervals?: number[]; // [1, 6, 12] months
customerCareReminderMessage?: string; // Template message
```

**UI Components**:
1. **Warranty Period Default** - Dropdown: 3/6/12/36 months (default 12)
2. **Customer Care Reminders Section**:
   - Enable/Disable toggle
   - Zalo Group Chat ID input (for receiving reminders)
   - Reminder intervals checkboxes: 1 tháng, 6 tháng, 12 tháng
   - Message template textarea (with placeholders: {{customer_name}}, {{device_model}}, {{warranty_months}}, {{sale_date}})
   - Test reminder button

### Phase 2: Type & Store Updates (`lib/store.tsx`)

#### Task 2.1: Update SystemSettings Interface
Add new fields to `SystemSettings` interface and `initialSystemSettings`

#### Task 2.2: Update Settings Persistence
- `lib/server/settings.ts` - Ensure new fields map to DB columns
- Add migration for new columns in `supabase/schema.sql`

### Phase 3: Customer Care Reminder Scheduler

#### Task 3.1: Design Scheduler Architecture
**Options**:
- **Option A**: Supabase pg_cron (recommended - runs in DB, reliable)
- **Option B**: Next.js API route + Vercel Cron / external cron (cron-job.org)
- **Option C**: Node.js background job (setInterval) - not recommended for serverless

**Recommendation**: Supabase pg_cron + Edge Function or API route

#### Task 3.2: Create Reminder Logic
**Query**: Find all sales/repairs where:
- `warranty_until` date is exactly 1 month, 6 months, or 12 months ago from today
- Status = 'delivered' or 'completed'
- Has customer phone/name

**Data Sources**:
- `service_tickets` table (repair tickets with warranty)
- `inventory_items` table (direct sales with `handover_date` + `warranty_months`)

**Message Format**:
```
🔔 [Nhắc nhở chăm sóc khách hàng]
Khách: {{customer_name}} ({{customer_phone}})
Thiết bị: {{device_model}} - {{service_tag}}
Ngày bàn giao: {{sale_date}}
Bảo hành: {{warranty_months}} tháng
⏰ Đã {{interval}} tháng kể từ ngày bán/bàn giao
→ Hãy chủ động liên hệ hỏi thăm, chăm sóc khách hàng!
```

#### Task 3.3: Implement Scheduler
1. Create API route: `app/api/cron/customer-care-reminders/route.ts`
2. Configure pg_cron in Supabase to call this daily at 9:00 AM
3. Use `sendZaloBotMessage` with `customerCareReminderChatId` from settings

### Phase 4: Inventory Sales Warranty Integration

#### Task 4.1: Verify Current Implementation
- "Tạo phiếu mới" page already has warranty selection (✓)
- `sellInventoryItem` already accepts `warrantyMonths` (✓)
- Need to ensure System Settings default is used when creating new sales

#### Task 4.2: Apply Default Warranty from Settings
- In `sellInventoryItem` or sales UI, read `defaultWarrantyMonths` from settings
- Pre-select this value in warranty dropdown

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN SETTINGS                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SystemSettings (lib/store.tsx)                          │   │
│  │ - defaultWarrantyMonths: 12                             │   │
│  │ - enableCustomerCareReminders: true                     │   │
│  │ - customerCareReminderChatId: "123456789"               │   │
│  │ - customerCareReminderIntervals: [1, 6, 12]             │   │
│  │ - customerCareReminderMessage: "template..."            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INVENTORY SALES FLOW                        │
│  sellInventoryItem(params.warrantyMonths || settings.default)  │
│                              │                                  │
│                              ▼                                  │
│  Creates: InventoryItem (warranty_months) + ServiceTicket       │
│  (warranty_duration_months, warranty_until, created_at)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CUSTOMER CARE REMINDER CRON                    │
│  Daily 9:00 AM → Query service_tickets + inventory_items        │
│  WHERE warranty_until / handover_date + warranty_months         │
│  = today - interval (1m, 6m, 12m)                              │
│                              │                                  │
│                              ▼                                  │
│  sendZaloBotMessage(chatId=settings.customerCareReminderChatId)│
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

### Core Files
1. `app/(admin)/cai-dat/page.tsx` - Main settings page UI changes
2. `lib/store.tsx` - SystemSettings interface & initial values
3. `lib/server/settings.ts` - DB field mapping for new settings
4. `supabase/schema.sql` - Add new columns to settings table

### New Files
5. `app/api/cron/customer-care-reminders/route.ts` - Cron endpoint
6. `lib/server/customerCareReminders.ts` - Reminder logic (reusable)

### Optional Files
7. `app/(admin)/phieu-sua-chua/tao-moi/page.tsx` - Apply default warranty from settings

---

## Security Considerations

### Zalo Bot Token/Secret
- ✅ Already in env vars (`ZALO_BOT_TOKEN`, `ZALO_BOT_SECRET_TOKEN`)
- ✅ Not stored in DB or client-side
- ✅ Current notice at line 1099 is sufficient: "Cấu hình qua biến môi trường ZALO_BOT_TOKEN và ZALO_BOT_SECRET_TOKEN trong .env.local (không lưu DB, không hiển thị trên UI)"
- **No additional security changes needed**

### Cron Endpoint Security
- Add `Authorization: Bearer CRON_SECRET` header check
- Store `CRON_SECRET` in env vars
- Supabase pg_cron can pass header via `http` extension

---

## Validation Plan

### Manual Testing
1. **Settings Page**:
   - [ ] Zalo Bot guide section removed
   - [ ] License Key tab removed
   - [ ] System Settings tab shows warranty dropdown (3/6/12/36)
   - [ ] Customer Care Reminders section visible with all fields
   - [ ] Save/Load persists new settings

2. **Inventory Sales**:
   - [ ] Default warranty from settings pre-selected in "Tạo phiếu mới"
   - [ ] Sale creates correct warranty_until date

3. **Customer Care Reminders**:
   - [ ] Cron endpoint returns 200 with test data
   - [ ] Zalo message sent to configured group
   - [ ] Message template renders with correct placeholders
   - [ ] Only triggers at exact 1/6/12 month intervals

### Automated Testing
- Unit test reminder query logic
- Integration test cron endpoint with mock Zalo Bot

---

## Open Questions for User

1. **Scheduler Approach**: Prefer Supabase pg_cron (runs in DB) or Vercel Cron / external cron service?
2. **Reminder Message Template**: Use the suggested format or customize?
3. **License Key Tab**: Remove entirely or keep as link in System Settings?
4. **Default Warranty**: Confirm 12 months as default (options: 3/6/12/36)?
5. **Reminder Intervals**: Fixed at [1, 6, 12] months or configurable?
6. **Data Source for Reminders**: Both `service_tickets` (repairs) AND `inventory_items` (direct sales), or just one?