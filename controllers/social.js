/*
 * Social controller
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-07-09 | Nicholas M. Dantas
 */

'use strict';

var router      = require('express').Router();
var business    = require('./../business/social');
var framework   = require('swt-framework');

// Postagens
//// Listar Todos
router.get('/social/posts', business.get.posts);
//// Listar Por ID
router.get('/social/posts/:id', business.get.postsById);
//// Listar Por Usuario
router.get('/social/posts/user/:id', business.get.postsByUser);
//// Criar
router.post('/social/posts', business.create.post);
//// Atualizar
router.put('/social/posts/:id', business.update.post);

// Comentarios
//// Listar Por Postagem
router.get('/social/posts/:id/comments', business.get.comments);
//// Criar
router.post('/social/posts/:id/comments', business.create.comment);
//// Atualizar
router.put('/social/posts/comments/:id', business.update.comment);

// Respostas
//// Listar Por Comentário
router.get('/social/comments/:id/replies', business.get.replies);
//// Criar
router.post('/social/comments/:id/replies', business.create.reply);
//// Atualizar
router.put('/social/comments/replies/:id', business.update.reply);

module.exports = router;