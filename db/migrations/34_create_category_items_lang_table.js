const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_category_items_lang`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.string('cat_item_title').notNullable();
        table.string('cat_item_slug').notNullable();
        table.string('meta_key').nullable();
        table.json('meta_value').nullable();
        table.integer('id_cat_item').unsigned().notNullable();
        table.integer('id_lang').unsigned().notNullable();

        table.foreign('id_cat_item').references('id').inTable(`${process.env.DB_PREFIX}_category_items`).onUpdate('CASCADE').onDelete('CASCADE');
        table.foreign('id_lang').references('id').inTable(`${process.env.DB_PREFIX}_langs`).onUpdate('CASCADE').onDelete('CASCADE');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_category_items_lang`);
};