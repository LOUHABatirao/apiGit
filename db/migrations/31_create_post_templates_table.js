const dotenv = require('dotenv');
dotenv.config();

exports.up = function(knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_post_templates`, (table) => {
        table.engine("InnoDB");
        table.increments('id');
        table.string('postTemplates_name').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_post_templates`);
};