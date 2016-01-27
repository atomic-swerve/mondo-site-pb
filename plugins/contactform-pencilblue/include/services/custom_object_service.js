'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);

    var util = pb.util;

    var CustomObjectService = function(){
        this.service = new pb.CustomObjectService();
    };

    CustomObjectService.TYPE = 'custom_object';

    util.inherits(CustomObjectService, Settings);

    CustomObjectService.prototype.getSettingsType = function(){
        return 'custom_object';
    };

    CustomObjectService.prototype.handle = function(data, callback){

        this.getSettings(function(err, settings){
            if(err) { return callback(err); }
            var typeId = settings.type;
            this.service.loadTypeByName(typeId, function(typeErr, type){
                if(typeErr || !pb.util.isObject(type)) { return this.typeError(callback); }
                var contact = this.build(data);
                pb.CustomObjectService.formatRawForType(contact, type);
                var doc = pb.DocumentCreator.create(CustomObjectService.TYPE, contact);
                this.service.save(doc, type, function(saveErr, result){
                    if(saveErr){ return callback(saveErr); }
                    if(util.isArray(result) && result.length > 0){ return this.saveError(callback); }
                    return callback(null, result);
                });
            }.bind(this));
        }.bind(this));
    };

    CustomObjectService.prototype.typeError = function(callback){
        var error = new Error('Invalid Custom Object Type (Contact)');
        pb.log.error(error.toString());
        return callback(error);
    };

    CustomObjectService.prototype.saveError = function(callback){
        var error = new Error('Custom Object Save');
        pb.log.error(error.toString());
        return callback(error);
    };

    CustomObjectService.prototype.build = function(data){
        var name = this.uniqueName(data.name);
        return {
            name: name,
            email: data.email,
            description: data.email,
            subject: data.subject,
            message: data.message,
            date: new Date()
        };
    };

    CustomObjectService.prototype.uniqueName = function(name){
        return name + ' (' + pb.util.uniqueId().toString() + ')';
    };

    CustomObjectService.prototype.createType = function(type, spec, callback){
        spec.name = type;
        this.service.saveType(spec, callback);
    };

    return CustomObjectService;
};
