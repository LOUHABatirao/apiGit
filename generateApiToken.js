const jwt = require('jsonwebtoken');
const knex = require('./db/knex');
const dotenv = require('dotenv');

dotenv.config();

const table_authorized_apps = `${process.env.DB_PREFIX}_authorized_apps`;

async function generateToken() {
    try {
        const host = 'localhost:3001';
        const name = 'Frontend Production'; // Give it a name
        
        console.log('Generating token for:', name);
        console.log('Host:', host);
        
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

        // Check if host exists
        const existingApp = await knex(table_authorized_apps)
            .where('host', host)
            .whereNull('deleted_at')
            .first();

        if (existingApp) {
            console.log('✓ Host already exists, updating...');
            await knex(table_authorized_apps)
                .where('id', existingApp.id)
                .update({ 
                    is_allowed: true,
                    token: token,
                    updated_at: knex.fn.now()
                });
            console.log('✓ Updated existing entry');
        } else {
            console.log('✓ Adding new host to database...');
            await knex(table_authorized_apps).insert({
                name: name,
                host: host,
                is_allowed: true,
                token: token,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });
            console.log('✓ Added new host to database');
        }

        console.log('\n🎉 Success! Copy the token above to your frontend .env file:');
        console.log(`API_TOKEN=${token}\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

generateToken();