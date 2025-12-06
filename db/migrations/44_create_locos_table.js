const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_locos`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.text('text').notNullable();
        table.text('translate').nullable();
        table.integer('id_lang').unsigned().notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_menus`);
};