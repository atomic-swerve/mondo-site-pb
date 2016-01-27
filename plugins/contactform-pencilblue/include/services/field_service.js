'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);

    var FieldService = function(){};

    pb.util.inherits(FieldService, Settings);

    FieldService.prototype.getSettingsType = function(){
        return 'fields';
    };

    FieldService.prototype.sanitize = function(data){
        var sanitizeHtml = require('sanitize-html');
        var options = this._getSanitizeOptions();
        var sanitized = {};
        for(var key in data){
            var value = data[key];
            sanitized[key] = sanitizeHtml(value, options);
        }
        return sanitized;
    };

    FieldService.prototype._getSanitizeOptions = function(){
        return {
            allowedTags: false,
            allowedAttributes: false
        };
    };

    FieldService.prototype.validate = function(data, callback){
        var Joi = require('joi');
        var options = { allowUnknown: true };
        this._getValidationSchema(function(err, schema){
            if(err){ return callback(err); }
            return Joi.validate(data, schema, options, callback);
        });
    };

    FieldService.prototype._getValidationSchema = function(callback){
        var ValidationCompiler = require('../utils/validation_compiler');
        this.getSettings(function(err, settings){
            if(err){ return callback(err); }
            var definitions = settings.definitions;
            var compiler = new ValidationCompiler();
            var compiled = compiler.compile(definitions);
            return callback(null, compiled);
        });
    };

    return FieldService;
};
