/*
 * Social engine framework for all SWT applications
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-07-08 | Nicholas M. Dantas
 */

'use strict';

// Inicia as variaveis de ambiente
if (process.argv.indexOf("--standalone") > -1) {
    require('dotenv').config();

    // Sobe a aplicação
    standalone(process.env.PORT);
}

var socialRouter  = require('./controllers/social');

module.exports = {
    controllers: {
        social: socialRouter
    },
    standalone: standalone
};

function standalone(port) {
    var express     = require('express');
    var bodyParser  = require('body-parser');
    var framework   = require('swt-framework');
    var controller  = require('./controllers/social');
    
    var app = express();

    app.use(bodyParser.json());
    app.use(framework.security.enablePreflight);
    //app.use(framework.security.checkAuthorization);

    // Rotas
    app.use('/api/v0', controller);

    // Middleware de erro
    app.use(framework.logger.middleware);

    app.listen(port || 8080);
    
    console.log('Standalone Server Started on Port ' + port + '...');
}