'use strict';

var Joi = require('joi');

var ValidationCompiler = function(){};

ValidationCompiler.prototype.compile = function(definitions){
    var keys = {};
    definitions.forEach(function(def){
        var pipe = this.getTypePipe(def);
        if(!pipe){ return; }
        pipe = this.required(def, pipe);
        keys[def.name] = pipe;
    }.bind(this));
    return Joi.object().keys(keys);
};

ValidationCompiler.typePipeFactory = {
    text: function(){ return Joi.string(); },
    email: function(){ return Joi.string().email(); }
};

ValidationCompiler.prototype.getTypePipe = function(definition){
    var type = definition.type;
    var factory = ValidationCompiler.typePipeFactory[type];
    if(factory){ return factory(); }
    var catchAll = 'text';
    return (ValidationCompiler.typePipeFactory[catchAll])();
};

ValidationCompiler.prototype.required = function(definition, pipe){
    var required = definition.required;
    if(required){ return pipe.required(); }
    return pipe.optional();
};

module.exports = ValidationCompiler;
