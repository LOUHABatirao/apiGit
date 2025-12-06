const dotenv = require('dotenv');
dotenv.config();

exports.up = function(knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_menu_items`, (table)=>{
        table.engine("InnoDB");
        table.increments('id');
        table.integer('id_menu').unsigned().notNullable();
        table.json('items').nullable();
        table.integer('id_lang').unsigned().notNullable();
        table.foreign('id_lang').references('id').inTable(`${process.env.DB_PREFIX}_langs`).onUpdate('CASCADE').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_menu_items`);
};
