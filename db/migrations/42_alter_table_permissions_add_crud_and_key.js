const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_permissions`, (table) => {
        table.string('key').notNullable().after('permissions_name');
        table.boolean('create').notNullable().defaultTo(false).after('key');
        table.boolean('delete').notNullable().defaultTo(false).after('create');
        table.boolean('update').notNullable().defaultTo(false).after('delete');
        table.boolean('show').notNullable().defaultTo(false).after('update');

    })
};

exports.down = function (knex) {
    return knex.schema.alterTable(`${process.env.DB_PREFIX}_permissions`, (table) => {
        table.dropColumn('key');
        table.dropColumn('create');
        table.dropColumn('delete');
        table.dropColumn('update');
        table.dropColumn('show');
    })
};