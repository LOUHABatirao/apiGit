const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_categories`, (table) => {
        table.timestamp('deleted_at').nullable();
    })
};

exports.down = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_categories`, (table) => {
        table.dropColumn(`deleted_at`);
    })
};