const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_posts_category_items`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.integer('id_post').unsigned().notNullable();
        table.integer('id_cat_item').unsigned().notNullable();
        table.foreign('id_post').references('id').inTable(`${process.env.DB_PREFIX}_posts`).onUpdate('CASCADE').onDelete('CASCADE');
        table.foreign('id_cat_item').references('id').inTable(`${process.env.DB_PREFIX}_category_items`).onUpdate('CASCADE').onDelete('CASCADE');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_posts_category_items`);
};