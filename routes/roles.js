const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const Knex = require('knex');
dotenv.config();
const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');

const roles_table = `${process.env.DB_PREFIX}_roles`;
const permissions_roles_table = `${process.env.DB_PREFIX}_permissions_roles`;
const permissions_table = `${process.env.DB_PREFIX}_permissions`;

//Get all roles
router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {


        knex.from(roles_table)
            .then(roles => {
                let rolePermissions = [];
                roles.forEach((role, i) => {
                    knex.select(permissions_table + '.*').from(permissions_table)
                        .innerJoin(permissions_roles_table, permissions_table + '.id', permissions_roles_table + '.id_permission')
                        .where(permissions_roles_table + '.id_role', '=', role.id)
                        .then(rows => {
                            role.permissions = rows;
                            rolePermissions.push(role)
                            if (i == roles.length - 1) {
                                res.status(200).json(rolePermissions);
                            }
                        });

                });



            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all roles by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {

        knex.from(roles_table)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add roles
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    // {
    //     "name": "admin",
    //     "permissions": [
    //         {"permissions_id" : 1},
    //         {"permissions_id" : 2},
    //         {"permissions_id" : 3}
    //     ]
    // }

    try {

        knex(roles_table)
            .insert({
                "roles_name": req.body.roles_name,
            })
            .then(rows => {

                if (req.body.permissions.length > 0) {
                    const id_role = rows[0];
                    const permissionsToInsert = req.body.permissions.map(permissions_id =>
                        ({ "id_role": id_role, "id_permission": permissions_id }));

                    knex(permissions_roles_table)
                        .insert(permissionsToInsert)
                        .then(rows => { res.status(200).json(rows); });
                } else {
                    res.status(200).json(rows);
                }

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update roles by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(roles_table)
            .where({ id: req.params.id })
            .update({
                "roles_name": req.body.roles_name,
                "updated_at": knex.fn.now()
            })
            .then(rows => {

                if (req.body.permissions.length > 0) {
                    knex(permissions_roles_table)
                        .where({ id_role: req.params.id })
                        .del()
                        .then(rows => {
                            const id_role = req.params.id;
                            const permissionsToInsert = req.body.permissions.map(permissions_id =>
                                ({ "id_role": id_role, "id_permission": permissions_id }));

                            knex(permissions_roles_table)
                                .insert(permissionsToInsert)
                                .then(rows => { res.status(200).json(rows); });
                        });
                } else {
                    res.status(200).json(rows);
                }

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete roles by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(roles_table)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


module.exports = router;