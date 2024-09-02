'use strict'

// Cargar validador de datos
var validator = require('validator');
const topic = require('../models/topic');

// Cargar el modelo de Topic
var Topic = require('../models/topic');

// Controlador de comentarios
var controller = {
    // Metodo para añadir un comentario
    add: function(req, res){
        // Recoger id del Topic
        var topicId = req.params.topicId;

        // Buscar y obtener el Topic por ID
        Topic.findById(topicId).exec((err, topicFound) => {
            if(err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topicFound) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El Id del Topic no existe'
                });
            }

            // Comprobar información de usuario y validar datos
            if(req.body.content) {
                 // Validar datos
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (error) {
                    return res.status(200).send({
                        message: 'No se ha enviado ningun comentario'
                    });
                }

                // Validación
                if(validate_content) {
                    // Crear un objeto de Comentarios con información del usuario
                    var comment = {
                        // Id del usuario que realiza el comentario (from Token)
                        user: req.user.sub,
                        content: req.body.content,
                        // El Date del comentario es automatico (revisar Models/Topic/CommentSchema)
                    };

                    // Agregar el comment  como sub documento de un Topic encontrado (push)
                    topicFound.comments.push(comment);

                    // Guardar el Topic con su nuevo comentario
                    topicFound.save((err) => {
                        if(err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        } else {
                            // RE-Buscar el topic por id agregando información del usuario y los comentarios por usuario (populate)
                            Topic.findById(topicFound._id)
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
                                        message: 'El comentario y el Topic se han guardado correctamente',
                                        topic: topicFound
                                    });
                                }
                                // NOTA: Ya que el objeto de usuarios está devolviendo la contraseña cifrada ... vamos a evitarlo en el archivo de Models de usuario
                            });
                        }
                    });
                } else {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Algunos datos no son validos'
                    });
                }
            }
        });

        
    },

    // Metodo editar comentario
    update: function(req, res){
        // Obtener Id del comentario (from URL)
        var commentId = req.params.commentId;
        
        // Obtener datos por PUT
        var params = req.body
        
        // Validar datos
        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                message: 'No se ha enviado ningun comentario'
            });
        }

        // Validación
        if(validate_content) {
            // Buscar y actualizar un subdocumento de un Topic
            Topic.findOneAndUpdate(  // ... ampliando parametros
                // Seleccionar el comentario a editar segun su id
                { "comments._id": commentId },
                // Operador de seleccion - Util para actualizar subdocumentos
                {
                    "$set": {   // Settear el contenido del nuevo comentario en el comentario seleccionado
                        "comments.$.content": params.content
                    }
                },
                // Obtener el topic mas reciente posible
                { new: true },
                // Comprobar y devolver datos
                (err, topicUpdated) => {
                    if(err) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }

                    if(!topicUpdated) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'El comentario no se ha actualizado'
                        });
                    } else {
                        return res.status(200).send({
                            status: 'success',
                            message: 'El comentario se ha actualizado correctamente',
                            topicUpdated: topicUpdated
                        });
                    }
                }
            );
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Algunos datos no son validos'
            });
        }
    },

    // Metodo eliminar comentario
    delete: function(req, res){
        // Obtener 2 Ids (Topics / Comment from URL)
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el Topic por id
        Topic.findById(topicId, (err, topicFound) => {
            if(err) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topicFound) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El ID del Topic no existe'
                });
            } else {
                
                // Seleccionar el comentario por el id 
                var comment = topicFound.comments.id(commentId);

                if(comment) {
                    // Eliminar subdocumento (si es que existe)
                    comment.remove();

                    // Guardar el Topic seleccionado
                    topicFound.save((err) => {
                        if(err) {
                            return res.status(404).send({
                                status: 'error',
                                message: 'El comentario no se ha eliminado'
                            });
                        } else {
                            return res.status(200).send({
                                status: 'success',
                                message: 'el comentario se ha eliminado correctamente',
                                topicSaved: topicFound
                            });
                        }
                    });
                } else {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El ID del comentario ya no existe'
                    });
                }
            }
        });
    }
}

module.exports = controller;