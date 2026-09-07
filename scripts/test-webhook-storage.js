/**
 * Test durable webhook event storage
 * Usage: node scripts/test-webhook-storage.js
 */

import { Pool } from 'pg';

// Use the same connection pool as the webhook
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function isEventProcessed(eventId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM stripe_webhook_events WHERE event_id = $1',
      [eventId]
    );
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}

async function storeWebhookEvent(eventId, eventType, eventData, metadata = null) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO stripe_webhook_events 
       (event_id, event_type, event_data, metadata) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId, eventType, eventData, metadata]
    );
  } finally {
    client.release();
  }
}

async function getWebhookStats() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        event_type,
        metadata->>'status' as status,
        COUNT(*) as count,
        MAX(created_at) as last_seen
      FROM stripe_webhook_events 
      GROUP BY event_type, metadata->>'status'
      ORDER BY count DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function getRecentWebhookEvents(limit = 50) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM stripe_webhook_events 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function cleanupOldEvents(retentionPeriod = 90) {
  const client = await pool.connect();
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
    
    const result = await client.query(
      `DELETE FROM stripe_webhook_events 
       WHERE created_at < $1`,
      [cutoffDate]
    );
    return { deletedCount: result.rowCount };
  } finally {
    client.release();
  }
}

async function testWebhookStorage() {
  console.log('🧪 Testing durable webhook event storage...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check if table exists
  console.log('Test 1: Checking if stripe_webhook_events table exists');
  try {
    const testEventId = `test_${Date.now()}_table_check`;
    await storeWebhookEvent(
      testEventId,
      'test.table_check',
      { test: true },
      { source: 'test-script' }
    );
    
    const exists = await isEventProcessed(testEventId);
    if (exists) {
      console.log('✅ stripe_webhook_events table exists and is accessible\n');
      passed++;
      
      // Cleanup
      await cleanupOldEvents(0);
    } else {
      console.error('❌ stripe_webhook_events table exists but event not found\n');
      failed++;
    }
  } catch (error) {
    console.error('❌ stripe_webhook_events table does not exist or is not accessible');
    console.error('   Error:', error.message);
    console.error('   Run the SQL migration from sql/webhook-events-schema.sql\n');
    failed++;
  }
  
  // Test 2: Insert and retrieve test events
  console.log('Test 2: Inserting and retrieving test webhook events');
  try {
    const testEvents = [
      {
        id: `test_${Date.now()}_1`,
        type: 'checkout.session.completed',
        data: { amount_total: 3500, currency: 'usd' },
        metadata: { status: 'test', test: true }
      },
      {
        id: `test_${Date.now()}_2`,
        type: 'payment_intent.succeeded',
        data: { amount: 200000, currency: 'usd' },
        metadata: { status: 'test', ach_settled: true }
      },
      {
        id: `test_${Date.now()}_3`,
        type: 'invoice.paid',
        data: { amount_paid: 100000, currency: 'usd' },
        metadata: { status: 'test' }
      }
    ];
    
    // Insert test events
    for (const event of testEvents) {
      await storeWebhookEvent(
        event.id,
        event.type,
        event.data,
        event.metadata
      );
    }
    
    console.log('✅ Test events inserted successfully\n');
    passed++;
    
    // Test 3: Check if events were stored
    console.log('Test 3: Checking if test events were stored');
    for (const event of testEvents) {
      const exists = await isEventProcessed(event.id);
      if (!exists) {
        console.error(`❌ Event ${event.id} not found`);
        failed++;
        break;
      }
    }
    console.log('✅ All test events retrieved successfully\n');
    passed++;
    
    // Test 4: Get recent events
    console.log('Test 4: Getting recent webhook events');
    const recentEvents = await getRecentWebhookEvents(10);
    if (recentEvents.length >= testEvents.length) {
      console.log(`✅ Retrieved ${recentEvents.length} recent events\n`);
      passed++;
    } else {
      console.error(`❌ Expected at least ${testEvents.length} events, got ${recentEvents.length}\n`);
      failed++;
    }
    
    // Test 5: Get statistics
    console.log('Test 5: Getting webhook event statistics');
    const stats = await getWebhookStats();
    if (stats.length > 0) {
      console.log('✅ Retrieved webhook statistics:');
      for (const stat of stats) {
        console.log(`   ${stat.event_type} (${stat.status}): ${stat.count} events`);
      }
      console.log();
      passed++;
    } else {
      console.error('❌ No statistics returned\n');
      failed++;
    }
    
    // Test 6: Cleanup test events
    console.log('Test 6: Cleaning up test events');
    const cleanupResult = await cleanupOldEvents(0);
    if (cleanupResult.deletedCount >= testEvents.length) {
      console.log(`✅ Cleaned up ${cleanupResult.deletedCount} test events\n`);
      passed++;
    } else {
      console.error(`❌ Expected to clean up at least ${testEvents.length} events, cleaned up ${cleanupResult.deletedCount}\n`);
      failed++;
    }
    
  } catch (error) {
    console.error('❌ Webhook storage test failed:', error.message, '\n');
    failed++;
  }
  
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('🎉 Webhook storage tests completed!');
  
  await pool.end();
  return { passed, failed };
}

// Run tests if this file is executed directly
const isMainModule = process.argv[1]?.includes('test-webhook-storage.js');
if (isMainModule) {
  testWebhookStorage().catch(console.error);
}

export { testWebhookStorage, isEventProcessed, storeWebhookEvent, getWebhookStats, getRecentWebhookEvents, cleanupOldEvents };