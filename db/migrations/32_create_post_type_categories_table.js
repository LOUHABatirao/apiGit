const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_post_type_categories`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.integer('id_post_type').unsigned().notNullable();
        table.integer('id_cat').unsigned().notNullable();
        table.foreign('id_cat').references('id').inTable(`${process.env.DB_PREFIX}_categories`).onUpdate('CASCADE').onDelete('CASCADE');
        table.foreign('id_post_type').references('id').inTable(`${process.env.DB_PREFIX}_post_type`).onUpdate('CASCADE').onDelete('CASCADE');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_post_type_categories`);
};
