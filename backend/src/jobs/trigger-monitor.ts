import { query } from '../config/database';
import { emailService } from '../services/email';

// This job should run daily via cron or scheduled task
export async function monitorTriggers() {
  console.log('Monitoring triggers...');

  try {
    // Check inactivity triggers
    await checkInactivityTriggers();

    // Check scheduled triggers
    await checkScheduledTriggers();

    // Send reminder emails
    await sendReminderEmails();

    console.log('Trigger monitoring completed');
  } catch (error) {
    console.error('Error monitoring triggers:', error);
  }
}

async function checkInactivityTriggers() {
  // Get all active inactivity triggers
  const result = await query(
    `SELECT 
      t.id,
      t.vault_id,
      t.inactivity_days,
      v.user_id,
      v.name as vault_name,
      u.email,
      u.last_activity_at
    FROM triggers t
    JOIN vaults v ON v.id = t.vault_id
    JOIN users u ON u.id = v.user_id
    WHERE t.trigger_type = 'inactivity' 
      AND t.status = 'active'
      AND u.last_activity_at IS NOT NULL`,
    []
  );

  for (const trigger of result.rows) {
    const lastActivity = new Date(trigger.last_activity_at);
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity >= trigger.inactivity_days) {
      // Trigger activated
      await query(
        `UPDATE triggers 
         SET status = 'triggered', triggered_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [trigger.id]
      );

      // TODO: Release vault content to executors
      console.log(`Trigger activated for vault ${trigger.vault_id}`);
    }
  }
}

async function checkScheduledTriggers() {
  const now = new Date();

  const result = await query(
    `SELECT 
      t.id,
      t.vault_id,
      v.name as vault_name
    FROM triggers t
    JOIN vaults v ON v.id = t.vault_id
    WHERE t.trigger_type = 'scheduled' 
      AND t.status = 'active'
      AND t.scheduled_date <= $1`,
    [now]
  );

  for (const trigger of result.rows) {
    await query(
      `UPDATE triggers 
       SET status = 'triggered', triggered_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [trigger.id]
    );

    // TODO: Release vault content
    console.log(`Scheduled trigger activated for vault ${trigger.vault_id}`);
  }
}

async function sendReminderEmails() {
  // Send reminders at 60, 75, 85 days of inactivity
  const thresholds = [60, 75, 85];

  for (const threshold of thresholds) {
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.last_activity_at,
        COUNT(t.id) as active_triggers
      FROM users u
      LEFT JOIN vaults v ON v.user_id = u.id
      LEFT JOIN triggers t ON t.vault_id = v.id AND t.status = 'active'
      WHERE u.last_activity_at IS NOT NULL
        AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.last_activity_at)) = $1
      GROUP BY u.id, u.email, u.last_activity_at`,
      [threshold]
    );

    for (const user of result.rows) {
      if (parseInt(user.active_triggers) > 0) {
        await emailService.sendProofOfLifeReminder(
          user.email,
          threshold
        );
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  monitorTriggers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

