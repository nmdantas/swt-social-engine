/*
 * Social business layer
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-20 | Nicholas M. Dantas
 */

'use strict';

var URI = 'mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_BASE;
var ObjectID = require('mongodb').ObjectID;
var accessLayer = require('mongodb').MongoClient;
var framework   = require('swt-framework');
var logManager  = framework.logger;

module.exports = {
    get: {
        posts: getPosts,
        postsById: getPostsById,
        postsByUser: getPostsByUser,
        comments: [],
        replies: []
    },
    create: {
        post: [postPreValidation, createPost],
        comment: [commentReplyPreValidation, createComment],
        reply: [commentReplyPreValidation, createReply]
    },
    update: {
        post: [postPreValidation, updatePost],
        comment: [],
        reply: []
    }
};

function getConnection(next, callback) {
    accessLayer.connect(URI, function(error, db) {
        // Early Return
        if (error) {
            next(error);
            return;
        }

        callback(db);
    });
}

function loadAndSendCollection(cursor, db, res, next) {
    var collection = [];

    cursor.each(function(err, doc) {
        if (doc != null) {
            collection.push(doc);
        } else {
            db.close();

            res.json(collection);

            next();
        }        
    });
}

function postPreValidation(req, res, next) {
    var constraints = framework.common.validation.requiredFor('title', 'content', 'cover');

    var validationErrors = framework.common.validation.validate(req.body, constraints);

    if (validationErrors) {
        var error = new framework.models.SwtError({
            message: 'Dados obrigatórios não preenchidos ou inválidos',
            httpCode: 401, 
            details: validationErrors
        });

        next(error);
    } else {
        next();
    }
}

function commentReplyPreValidation(req, res, next) {
    var constraints = framework.common.validation.requiredFor('content');

    var validationErrors = framework.common.validation.validate(req.body, constraints);

    if (validationErrors) {
        var error = new framework.models.SwtError({
            message: 'Dados obrigatórios não preenchidos ou inválidos',
            httpCode: 401, 
            details: validationErrors
        });

        next(error);
    } else {
        next();
    }
}

function getPosts(req, res, next) {
    getConnection(next, function(db) {
        var cursor = db.collection('posts').find();
        
        loadAndSendCollection(cursor, db, res, next);
    });
}

function getPostsById(req, res, next) {
    getConnection(next, function(db) {
        var cursor = db.collection('posts').find({
            _id: ObjectID(req.params.id)
        });        

        loadAndSendCollection(cursor, db, res, next);
    });
}

function getPostsByUser(req, res, next) {
    getConnection(next, function(db) {
        var cursor = db.collection('posts').find({
            author_id: req.params.id
        });        

        loadAndSendCollection(cursor, db, res, next);
    });
}

function createPost(req, res, next) {
    getConnection(next, function(db) {
        req.body.author_id = 0, // Obter do cache
        req.body.author_name = '', // Obter do cache
        req.body.comments = [];
        req.body.likes = [];

        db.collection('posts').insertOne(req.body, function(error, result) {
            if (error) {
                next(error);
            } else {
                res.json(result);

                next();
            }
        });
    });
}

function updatePost(req, res, next) {
    getConnection(next, function(db) {
        db.collection('posts').updateOne({
            _id: ObjectID(req.params.id)
        }, {
            $set: req.body
        }, function(error, result) {
            if (error) {
                next(error);
            } else {
                res.json(result);

                next();
            }
        });
    });
}

function createComment(req, res, next) {
    getConnection(next, function(db) {
        db.collection('posts').updateOne({
            _id: ObjectID(req.params.id)
        }, {
            $push: {
                comments: {
                    _id: ObjectID(),
                    author_id: 0, // Obter do cache
                    author_name: '', // Obter do cache
                    content: req.body.content,
                    replies: []
                }
            }
        }, function(error, result) {
            if (error) {
                next(error);
            } else {
                res.json(result);

                next();
            }
        });
    });
}

function createReply(req, res, next) {
    getConnection(next, function(db) {
        db.collection('posts').updateOne({
            comments: {
                $elemMatch: {
                    _id: ObjectID(req.params.id)
                }
            }
        }, {
            $push: {
                'comments.$.replies': {
                    _id: ObjectID(),
                    author_id: 0, // Obter do cache
                    author_name: '', // Obter do cache
                    content: req.body.content
                }
            }
        }, function(error, result) {
            if (error) {
                next(error);
            } else {
                res.json(result);

                next();
            }
        });
    });
}