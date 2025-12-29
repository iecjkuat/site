require('dotenv').config();
const { supabase } = require('./lib/supabase');
const fs = require('fs');

async function getTables() {
    try {
        const tablesToCheck = [
            'users', 'clubs', 'events', 'event_attendees', 'projects', 'ideas',
            'resources', 'votes', 'notifications', 'payments',
            'messages', 'message_recipients', 'chat_groups',
            'analytics_views', 'system_metrics', 'user_sessions',
            'financial_transactions', 'budget_line_items', 'annual_budgets',
            'donations_sponsorships', 'payment_receipts', 'bank_accounts',
            'report_templates', 'scheduled_reports', 'event_feedback',
            'opportunity_categories', 'opportunities', 'opportunity_applications'
        ];

        let foundCount = 0;
        const foundTables = [];

        for (const table of tablesToCheck) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                foundTables.push(`${table}: ${count} rows`);
                foundCount++;
            }
        }

        const output = `Verified ${foundCount} active tables:\n` + foundTables.join('\n');
        fs.writeFileSync('table_count.txt', output);

    } catch (err) {
        fs.writeFileSync('table_count.txt', 'Error: ' + err.message);
    }
}

getTables();
