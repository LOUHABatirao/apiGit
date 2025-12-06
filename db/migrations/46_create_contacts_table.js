const dotenv = require('dotenv');
dotenv.config();

exports.up = function(knex) {
    return knex.schema.createTable(`${process.env.DB_PREFIX}_contacts`, (table)=>{
        table.engine("InnoDB");
        table.increments('id');
        table.string('name').notNullable();
        table.string('tel').notNullable();
        table.string('email').notNullable();
        table.string('company').nullable();
        table.string('subject').notNullable();
        table.string('info').notNullable();
        table.string('source').nullable();
        table.string('placement').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable(`${process.env.DB_PREFIX}_contacts`);
};
