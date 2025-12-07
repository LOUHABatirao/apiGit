const jwt = require('jsonwebtoken');
const knex = require('./db/knex');
const dotenv = require('dotenv');

dotenv.config();

const table_authorized_apps = `${process.env.DB_PREFIX}_authorized_apps`;

async function generateToken() {
    try {
        // The host that will use this token
        const host = 'http://localhost:3001'; // Your frontend IP
        
        console.log('Generating token for host:', host);
        
        // Generate the token
        const token = jwt.sign(
            { host: host },
            process.env.TOKEN_SECRET
        );

        console.log('\n=================================');
        console.log('Your new API Token:');
        console.log('=================================');
        console.log(token);
        console.log('=================================\n');

        // Add to database
        const existingApp = await knex(table_authorized_apps)
            .where('host', host)
            .whereNull('deleted_at')
            .first();

        if (existingApp) {
            console.log('Host already exists in database');
            await knex(table_authorized_apps)
                .where('id', existingApp.id)
                .update({ is_allowed: true });
            console.log('Updated to is_allowed = true');
        } else {
            await knex(table_authorized_apps).insert({
                host: host,
                is_allowed: true,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });
            console.log('Added new host to database');
        }

        console.log('\n✓ Done! Copy the token above to your frontend .env file\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

generateToken();