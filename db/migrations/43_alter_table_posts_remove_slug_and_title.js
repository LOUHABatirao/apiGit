const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_posts`, (table) => {
        table.dropColumn('post_slug');
        table.dropColumn('post_title');
    })
};

exports.down = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_posts`, (table) => {

        table.string('post_title').notNullable().after('id');
        table.string('post_slug').notNullable().after('post_title');
    })
};