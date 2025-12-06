const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_authorized_apps`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.string('name');
        table.string('host').nullable();
        table.boolean('is_allowed').notNullable().defaultTo(false);
        table.text('token').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_authorized_apps`);
};
