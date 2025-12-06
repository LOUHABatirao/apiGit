const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_post_templates`, (table) => {
        table.timestamp('deleted_at').nullable();
    })
};

exports.down = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_post_templates`, (table) => {
        table.dropColumn(`deleted_at`);
    })
};
