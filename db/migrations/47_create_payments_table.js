const dotenv = require('dotenv');
dotenv.config();

exports.up = function(knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_payments`, (table)=>{
        table.engine("InnoDB");
        table.increments('id');
        table.decimal('amount', 10, 2).notNullable();
        table.string('currency', 3).notNullable().defaultTo('USD');
        table.text('description').nullable();
        table.integer('user_id').unsigned().nullable();
        table.string('status').notNullable().defaultTo('initiated');
        table.string('transaction_id').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_payments`);
};