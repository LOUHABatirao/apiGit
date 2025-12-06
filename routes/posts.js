const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const lodash = require('lodash');
dotenv.config();

const verifyApiToken = require('../verify/verifyApiToken');

const axios = require('axios');

const table_posts = `${process.env.DB_PREFIX}_posts`;
const table_post_meta = `${process.env.DB_PREFIX}_post_meta`;
const table_selected_categories_items = `${process.env.DB_PREFIX}_selected_categories_items`;
const table_langs = `${process.env.DB_PREFIX}_langs`;
const post_template_table = `${process.env.DB_PREFIX}_post_templates`;
const post_type_table = `${process.env.DB_PREFIX}_post_type`;


//Get all posts
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {

                knex.from(table_posts)
                    .join(table_post_meta, table_posts + '.id', '=', table_post_meta + '.id_post')
                    .where('id_lang', rows[0].id)
                    .whereNull('deleted_at')
                    .then(posts => {
                        res.status(200).json(posts);
                    });
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get post by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {

        knex.from(table_posts)
            .where({ id: req.params.id })
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by ID
router.get('/slug/:slug/:id_lang', verifyApiToken, async (req, res) => {
    try {
        knex.select(
            table_posts + '.post_status',
            table_posts + '.id_post_type',
            table_post_meta + '.id_post',
            table_posts + '.id_post_templates',
            post_template_table + '.postTemplates_name',
            table_post_meta + '.id_lang'
        )
            .from(table_posts)
            .leftJoin(post_template_table, post_template_table + '.id', table_posts + '.id_post_templates')
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where({ meta_value: req.params.slug })
            .where({ meta_key: "slug" })
            // .where('id_lang', req.params.id_lang)
            .whereNull(table_posts + '.deleted_at')
            .then(posts => {
                if (!posts.length) return res.status(200).json([]);

                knex.select(
                    table_post_meta + '.meta_value',
                )
                    .from(table_post_meta)
                    .where({ id_post: posts[0].id_post })
                    .where('id_lang', req.params.id_lang)
                    .where({ meta_key: "fields" })
                    .then(postsFields => {
                        posts[0].fields = JSON.parse(postsFields[0].meta_value);
                        res.status(200).json(posts[0]);
                    });
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by langcode
router.get('/slug/langcode/:slug/:langs_code', verifyApiToken, async (req, res) => {
    try {
        const getMetaValue = (lang_code, posts) => {
            knex.select(
                table_post_meta + '.meta_value',
            )
                .from(table_post_meta)
                .where({ id_post: posts[0].id_post })
                .join(table_langs, table_langs + '.id', table_post_meta + '.id_lang')
                .where(table_langs + '.langs_code', lang_code)
                .where({ meta_key: "fields" })
                .then(postsFields => {
                    posts[0].fields = JSON.parse(postsFields[0].meta_value);
                    res.status(200).json(posts[0]);
                });
        }
        knex.select(
            table_posts + '.post_status',
            table_posts + '.id_post_type',
            table_post_meta + '.id_post',
            table_posts + '.id_post_templates',
            post_template_table + '.postTemplates_name',
            table_post_meta + '.id_lang'
        )
            .from(table_posts)
            .leftJoin(post_template_table, post_template_table + '.id', table_posts + '.id_post_templates')
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where({ meta_value: req.params.slug })
            .where({ meta_key: "slug" })
            .whereNull(table_posts + '.deleted_at')
            .then(posts => {
                if (!posts.length) return res.status(200).json([]);

                if (req.params.langs_code) {
                    getMetaValue(req.params.langs_code, posts);
                } else {
                    knex.from(table_langs)
                        .where({ langs_default: true })
                        .then(rows => {
                            getMetaValue(rows[0].langs_code, posts);
                        });
                }

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add posts
router.post('/', verifyApiToken, async (req, res) => {

    try {
        knex(table_posts)
            .insert({
                "post_status": req.body.post_status,
                "id_post_type": req.body.id_post_type,
                "id_post_templates": req.body.id_post_templates
            })
            .then(async rows => {

                const id_post = rows[0];

                if (req.body.fields.length > 0) {
                    knex(table_post_meta)
                        .insert([
                            {
                                "meta_key": "title",
                                "meta_value": req.body.post_title,
                                "id_post": id_post,
                                "id_lang ": req.body.id_lang,
                            },
                            {
                                "meta_key": "slug",
                                "meta_value": req.body.post_slug,
                                "id_post": id_post,
                                "id_lang ": req.body.id_lang,
                            },
                            {
                                "meta_key": "fields",
                                "meta_value": JSON.stringify(req.body.fields),
                                "id_post": id_post,
                                "id_lang ": req.body.id_lang,
                            }
                        ]
                        ).then(rows => { });
                }

                if (req.body.categories.length > 0) {
                    const categoriesToInsert = req.body.categories.map(element =>
                        ({ "id_post": id_post, "id_cat": element.id_cat, "id_cat_item": element.id_cat_item }));

                    knex(table_selected_categories_items)
                        .insert(categoriesToInsert)
                        .then(rows => { });
                }

                res.status(200).json(rows);

            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update posts by ID
router.patch('/:id', verifyApiToken, async (req, res) => {

    try {
        knex(table_posts)
            .where({ id: req.params.id })
            .update({
                "post_status": req.body.post_status,
                "id_post_type": req.body.id_post_type,
                "id_post_templates": req.body.id_post_templates,
                "updated_at": knex.fn.now()
            })
            .then(async rows => {

                const id_post = req.params.id;

                if (req.body.fields.length > 0) {

                    knex(table_post_meta)
                        .where({
                            id_post: req.params.id,
                            id_lang: req.body.id_lang
                        })
                        .then(rows => {

                            if (rows.length) {
                                knex(table_post_meta)
                                    .where({
                                        id_post: req.params.id,
                                        id_lang: req.body.id_lang,
                                        meta_key: 'fields'
                                    })
                                    .update({
                                        "meta_key": "fields",
                                        "meta_value": JSON.stringify(req.body.fields),
                                        "id_post": id_post,
                                        "id_lang ": req.body.id_lang,
                                    })
                                    .then(rows => { });

                                knex(table_post_meta)
                                    .where({
                                        id_post: req.params.id,
                                        id_lang: req.body.id_lang,
                                        meta_key: 'title'
                                    })
                                    .update({
                                        "meta_key": "title",
                                        "meta_value": req.body.post_title,
                                        "id_post": id_post,
                                        "id_lang ": req.body.id_lang,
                                    })
                                    .then(rows => { });

                                knex(table_post_meta)
                                    .where({
                                        id_post: req.params.id,
                                        id_lang: req.body.id_lang,
                                        meta_key: 'slug'
                                    })
                                    .update({
                                        "meta_key": "slug",
                                        "meta_value": req.body.post_slug,
                                        "id_post": id_post,
                                        "id_lang ": req.body.id_lang,
                                    })
                                    .then(rows => { });

                            } else {

                                knex(table_post_meta)
                                    .insert([
                                        {
                                            "meta_key": "title",
                                            "meta_value": req.body.post_title,
                                            "id_post": id_post,
                                            "id_lang ": req.body.id_lang,
                                        },
                                        {
                                            "meta_key": "slug",
                                            "meta_value": req.body.post_slug,
                                            "id_post": id_post,
                                            "id_lang ": req.body.id_lang,
                                        },
                                        {
                                            "meta_key": "fields",
                                            "meta_value": JSON.stringify(req.body.fields),
                                            "id_post": id_post,
                                            "id_lang ": req.body.id_lang,
                                        }
                                    ]
                                    ).then(rows => { });

                            }

                        });

                }

                if (req.body.categories.length > 0) {
                    knex(table_selected_categories_items)
                        .where({ id_post: req.params.id })
                        .del()
                        .then(rows => {
                            const categoriesToInsert = req.body.categories.map(element =>
                                ({ "id_post": id_post, "id_cat": element.id_cat, "id_cat_item": element.id_cat_item }));

                            knex(table_selected_categories_items)
                                .insert(categoriesToInsert)
                                .then(rows => { });

                        });
                }

                res.status(200).json(rows);

            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Delete posts by ID
router.delete('/destroy/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_posts)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Trash posts by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_posts)
            .where({ id: req.params.id })
            .update({
                "deleted_at": knex.fn.now(),
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Restor post by ID
router.post('/restore/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_posts)
            .where({ id: req.params.id })
            .update({
                "deleted_at": null,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by ID post_type
router.get('/post-type/:id', verifyApiToken, async (req, res) => {

    try {

        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {

                knex.select(table_posts + '.*', table_post_meta + '.meta_key', table_post_meta + '.meta_value')
                    .from(table_posts)
                    .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
                    .where(table_posts + '.id_post_type', req.params.id)
                    .where('id_lang', rows[0].id)
                    .then(rows => {

                        let tempRows = lodash.chunk(rows, 3);
                        let postsArray = [];

                        tempRows.map((itemRows, i) => {
                            let post = itemRows[0];

                            itemRows.map((item, j) => {

                                item.meta_key == "title" ?
                                    post.title = item.meta_value

                                    : item.meta_key == "slug" ?
                                        post.slug = item.meta_value

                                        : item.meta_key == "fields" ?
                                            post.fields = item.meta_value
                                            : null

                                return post;
                            });

                            postsArray.push(post);

                        });

                        res.status(200).json(postsArray);
                    });

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by ID post_type and lang
router.get('/post-type/:id/:id_lang', verifyApiToken, async (req, res) => {

    try {


        knex.select(table_posts + '.*', table_post_meta + '.meta_key', table_post_meta + '.meta_value')
            .from(table_posts)
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where(table_posts + '.id_post_type', req.params.id)
            .where('id_lang', req.params.id_lang)
            .then(rows => {

                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value

                                    : null

                        return post;

                    });

                    postsArray.push(post);
                });

                res.status(200).json(postsArray);

            });


    } catch (err) {

        res.status(500).json({ message: err });

    }

});

//Get all posts by lang
router.get('/post-by-lang/:id_lang', verifyApiToken, async (req, res) => {

    try {


        knex.select(table_posts + '.*',
            table_post_meta + '.meta_key',
            table_post_meta + '.meta_value',
            post_template_table + ".postTemplates_name"
        )
            .from(table_posts)
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .join(post_template_table, post_template_table + '.id', table_posts + '.id_post_templates')
            .where('id_lang', req.params.id_lang)
            .then(rows => {

                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value

                                    : null

                        return post;

                    });

                    postsArray.push(post);
                });

                res.status(200).json(postsArray);

            });


    } catch (err) {

        res.status(500).json({ message: err });

    }

});

//Get all posts by ID post_type
router.get('/post-type/slug/:slug/:id_lang', verifyApiToken, async (req, res) => {

    try {

        knex.select(table_posts + '.*',
            table_post_meta + '.meta_key',
            table_post_meta + '.meta_value')
            .from(table_posts)
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .join(post_type_table, post_type_table + '.id', table_posts + '.id_post_type')
            .where(post_type_table + '.post_type_slug', req.params.slug)
            .where('id_lang', req.params.id_lang)
            .then(rows => {

                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value
                                    : null

                        return post;
                    });

                    postsArray.push(post);

                });

                res.status(200).json(postsArray);
            });


    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by ID post_type
router.get('/post-type/menu/:id/:id_lang', verifyApiToken, async (req, res) => {

    try {
        knex.select(table_posts + '.*',
            table_post_meta + '.meta_key',
            table_post_meta + '.meta_value',
            post_template_table + '.postTemplates_name')
            .from(table_posts)
            .leftJoin(post_template_table, post_template_table + '.id', table_posts + '.id_post_templates')
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where(table_posts + '.id_post_type', req.params.id)
            .where('id_lang', req.params.id_lang)
            .then(rows => {

                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value
                                    : null

                        return post;
                    });

                    postsArray.push(post);

                });

                res.status(200).json(postsArray);
            });


    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by Lang
router.get('/:id_post/:id_lang', verifyApiToken, async (req, res) => {
    try {

        knex.select(table_posts + '.*',
            table_post_meta + '.meta_key',
            table_post_meta + '.meta_value',
            table_post_meta + '.id_lang'
        )
            .from(table_posts)
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where(table_posts + '.id', req.params.id_post)
            .where('id_lang', req.params.id_lang)
            .then(rows => {
                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value
                                    : null

                        return post;
                    });

                    postsArray.push(post);

                });

                res.status(200).json(postsArray);
            });


    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all posts by Lang
router.get('/langcode/:id_post/:langs_code', verifyApiToken, async (req, res) => {
    try {

        knex.select(table_posts + '.*',
            table_post_meta + '.meta_key',
            table_post_meta + '.meta_value',
            table_post_meta + '.id_lang'
        )
            .from(table_posts)
            .join(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .join(table_langs, table_langs + '.id', table_post_meta + '.id_lang')
            .where(table_langs + '.langs_code', req.params.langs_code)
            .where(table_posts + '.id', req.params.id_post)
            .then(rows => {
                let tempRows = lodash.chunk(rows, 3);
                let postsArray = [];

                tempRows.map((itemRows, i) => {
                    let post = itemRows[0];

                    itemRows.map((item, j) => {

                        item.meta_key == "title" ?
                            post.title = item.meta_value

                            : item.meta_key == "slug" ?
                                post.slug = item.meta_value

                                : item.meta_key == "fields" ?
                                    post.fields = item.meta_value
                                    : null

                        return post;
                    });

                    postsArray.push(post);

                });

                res.status(200).json(postsArray);
            });


    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all trashed posts by ID post_type
router.get('/post-type/trashed/:id', verifyApiToken, async (req, res) => {

    try {

        knex.select(table_posts + '.*', table_post_meta + '.meta_key', table_post_meta + '.meta_value')
            .from(table_posts)
            .leftJoin(table_post_meta, table_posts + '.id', table_post_meta + '.id_post')
            .where(table_posts + '.id_post_type', req.params.id)
            .whereNotNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows[0]);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


module.exports = router;