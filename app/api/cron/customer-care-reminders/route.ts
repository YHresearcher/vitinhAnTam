import { NextRequest, NextResponse } from 'next/server';
import { runCustomerCareReminders, testCustomerCareReminder } from '@/lib/server/customerCareReminders';
import { getStoredSettingsAsync } from '@/lib/server/settings';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  if (CRON_SECRET && providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }
  
  try {
    const result = await runCustomerCareReminders();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      sent: result.sent,
      errors: result.errors,
      details: result.details,
    });
  } catch (error) {
    console.error('[Cron] Customer care reminders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  if (CRON_SECRET && providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'test') {
      // Test endpoint - gửi tin nhắn test
      const settings = await getStoredSettingsAsync();
      const chatId = settings.customerCareReminderChatId?.trim();
      const messageTemplate = settings.customerCareReminderMessage || '';
      const apiBaseUrl = settings.botApiBaseUrl?.trim();
      
      if (!chatId) {
        return NextResponse.json(
          { success: false, error: 'Chat ID không được cấu hình' },
          { status: 400 }
        );
      }
      
      if (!messageTemplate) {
        return NextResponse.json(
          { success: false, error: 'Mẫu tin nhắn không được cấu hình' },
          { status: 400 }
        );
      }
      
      const result = await testCustomerCareReminder(chatId, messageTemplate, apiBaseUrl);
      
      return NextResponse.json({
        success: result.ok,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Default: run reminders
    const result = await runCustomerCareReminders();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      sent: result.sent,
      errors: result.errors,
      details: result.details,
    });
  } catch (error) {
    console.error('[Cron] Customer care reminders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}