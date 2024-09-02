'use strict'

// Cargar el modelo de Topicos
var Topic = require('../models/topic');
// Cargar Validator
var validator = require('validator');
const topic = require('../models/topic');
const { geoSearch } = require('../models/topic');

var controller = {
    // Método guardar Topics
    save: function(req, res) {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        // Comprobar validación
        if(validate_content && validate_title && validate_lang) {
            // Asignar valores al objeto topic
            var topic = new Topic();
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            // ID del usuario contenido en JWT (req.user.sub)
            topic.user = req.user.sub;
            
            // Guardar el documento topic
            topic.save((err, topicSaved) => {
                if(err || !topicSaved) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Los datos no se han podido guardar'
                    });   
                } else {
                    return res.status(200).send({
                        status: 'success',
                        message: 'El topic se ha registrado correctamente',
                        topicSaved
                    });   
                }
            });
        } else {
            return res.status(200).send({
                message: 'Los datos no son válidos'
            });    
        }
    },

    // Método obtener todos los Topics con paginación
    getTopics: function(req, res) {
        // NOTA: Se ha cargado en Models la libreria mongose_paginator
        // Recoger y validar datos para pagina
        if(!req.params.page || req.params.page == null || req.params.page == undefined || req.params.page == "0") {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }

        // Configurar opciones de paginación
        var options = {
            // 1 -> mas viejo a mas nuevo / -1 -> mas nuevo a mas viejo
            sort: { date: -1 },
            // Cargar el objeto de usuario que creó el Topic
            populate: 'user',
            // Limite de entradas por página
            limit: 5,
            // Pagina a mostrar
            page: page
        }

        // Aplicando paginación
        Topic.paginate({}, options, (err, topicsPaginated) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            } 
            
            if(!topicsPaginated) {
                return res.status(404).send({
                    status: 'not-found',
                    message: 'No hay topicos para mostrar'
                }); 
            } else {
                // Devolviendo: (topics paginados, cantidad de topics, cantidad de paginas)
                return res.status(200).send({
                    status: 'success',
                    topics: topicsPaginated.docs,
                    totalDocs: topicsPaginated.totalDocs,
                    totalPages: topicsPaginated.totalPages
                });
            }
        })

    },

    // Metodo para obtener los topics por usuario
    getTopicsByUser: function(req, res) {
        // Obtener ID de usuario
        var userId = req.params.user_id;

        // Buscar los topics por usuario
        Topic.find({
            user: userId
        })

        // Ordenar por fecha descendente (mongoose)
        .sort([[ 'date', 'descending' ]])
        // Ejecutar consulta
        .exec((err, topicsFound) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición de topics'
                });
            }

            if(!topicsFound) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics para mostrar'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    topics: topicsFound
                });
            }
        });
    },
     
    // Obtener un solo tópico por el id
    getTopic: function(req, res) {
        // Obtener el id del topic
        var topicId = req.params.id;

        // Buscar el topic por id agregando información del usuario y los comentarios por usuario (populate)
        Topic.findById(topicId)
             .populate('user')
             .populate('comments.user')
             .exec((err, topicFound) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición de topic'
                });
            }

            if(!topicFound) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El Topic no existe'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    topic: topicFound
                });
            }

            // NOTA: Ya que el objeto de usuarios está devolviendo la contraseña cifrada ... vamos a evitarlo en el archivo de Models de usuario
        });
    },

    // Método para actualizar datos de un Topic
    update: function(req, res) {
        // Recoger el id del topic y desde el POST (desde la URL)
        var topicId = req.params.id;
        var params = req.body;

        // Validar datos del POST
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content && validate_lang){
            // Crear un json con los datos a modificar
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            // Buscar y actualizar el topic por ID del Topic y por ID del usuario
            //                        {id/Topic    id/usuario (desde JWT)}, Objeto a actualizar, {Opciones(lo mas actualizado posible)}
            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true } , (err, topicUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición',
                    });
                }

                if(!topicUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El Topic no se ha actualizado',
                    });
                }
                
                return res.status(200).send({
                    status: 'success',
                    message: 'El topic se ha actualizado correctamente',
                    topic: topicUpdated
                });
            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Algunos datos no son validos'
            })
        }
    },

    // Metodo para eliminat un Topic
    delete: function(req, res) {
        // Obtener el id del topic enviado por URL
        var topicId = req.params.id

        // Buscar y eliminar por id/topic y por id/Usuario
        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemoved) => {
            if(err){
                return res.status(200).send({
                    message: 'Error en la petición'
                });
            }

            if(!topicRemoved){
                return res.status(200).send({
                    status: 'error',
                    message: 'El Topic no se ha eliminado'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    message: 'El Topico se ha eliminado correctamente',
                    topicRemoved: topicRemoved
                });
            }
        });
    },

    // Metodo buscar un topic
    search: function(req, res) {
        // Obtener string de busqueda (from URL)
        var search_txt = req.params.search;

        // Buscar Topics semejantes (condiciones con OR)
        Topic.find({ "$or": [   // Agrupar condiciones
            // Semejanza de titulo
            { "title": { "$regex": search_txt, "$options": "i"} },
            // Semejanza de contenido
            { "content": { "$regex": search_txt, "$options": "i"} },
            // Semejanza de lang
            { "lang": { "$regex": search_txt, "$options": "i"} },
            // Semejanza de code
            { "code": { "$regex": search_txt, "$options": "i"} },
        ]})
        // Populate de usuarios (Añadir información de usuario)
        .populate('user')
        // Ordenar por fecha descendente (mongoose)
        .sort([[ 'date', 'descending' ]])
        // Ejecutar consulta
        .exec((err, topicsFound) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topicsFound || topicsFound.length == 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay Topics para mostrar'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    message: 'Hay algunas coincidencias',
                    topicsFound
                });
            }
        });
    }
}

module.exports = controller;