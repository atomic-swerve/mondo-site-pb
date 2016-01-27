'use strict';

var async = require('async');

module.exports = function(pb){

    var services = '../../include/services';
    var CaptchaService = require(services + '/captcha_service')(pb);
    var EmailService = require(services + '/email_service')(pb);
    var CustomObjectService = require(services + '/custom_object_service')(pb);
    var FieldService = require(services + '/field_service')(pb);

    var BaseController = pb.BaseController;

    var ContactForm = function(){
        this.fieldService = new FieldService();
    };

    pb.util.inherits(ContactForm, pb.ApiActionController);

    var ACTIONS = { send: false };

    ContactForm.prototype.getActions = function(){
        return ACTIONS;
    };

    ContactForm.prototype.getPostParams = function(callback){
        this.getJSONPostParams(function(err, params){
            return callback(null, params);
        });
    };

    ContactForm.prototype.validatePostParameters = function(action, post, callback) {
        return callback(null, []);
    };

    ContactForm.prototype.send = function(callback){
        var post = this.post;
        this.validate(post, function(err, content){
            if(err){ return this.sendValidationError(err, callback); }
            this.validateCaptcha(content, function(validateErr, validCaptcha){
                if(validateErr){ return this.sendApiError(content, callback); }
                if(!validCaptcha){ return this.sendCaptchaError(content, callback); }
                // Validated + Captcha Ok.
                var sanitized = this.sanitize(content);
                var handlers = this.getHandlers();
                this.handle(handlers, sanitized, function(handleErr){
                    if(handleErr){ return this.sendApiError(sanitized, callback); }
                    return this.sendApiSuccess(sanitized, callback);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    ContactForm.prototype.sendApiSuccess = function(data, callback){
        var result = this._getSuccess(data, 'CF_API_SENT');
        return callback(result);
    };

    ContactForm.prototype.sendValidationError = function(data, callback){
        var error = this._getError(data, 'CF_API_VALIDATION');
        return callback(error);
    };

    ContactForm.prototype.sendCaptchaError = function(data, callback){
        var error = this._getError(data, 'CF_API_CAPTCHA_VALIDATION');
        return callback(error);
    };

    ContactForm.prototype.sendApiError = function(data, callback){
        var error = this._getError(data, 'CF_API_ERROR');
        return callback(error);
    };

    ContactForm.prototype.handle = function(handlers, data, callback){
        var handled = false;
        async.each(handlers, function(handler, cb){
            handler.isEnabled(function(err, enabled){
                if(!enabled){ return cb(); }
                handler.handle(data, cb);
                handled = true;
            });
        }, function(err){
            if(!err && !handled){ err = new Error('No Handlers Enabled'); }
            return callback(err);
        });
    };

    ContactForm.prototype.getHandlers = function(){
        return [
            new EmailService(),
            new CustomObjectService()
        ];
    };

    ContactForm.prototype.validateCaptcha = function(data, callback){
        var captcha = new CaptchaService();
        captcha.isEnabled(function(err, enabled){
            if(err){ return callback(err); }
            if(!enabled){ return callback(null, true); }
            var key = data.sckey;
            var value = data.scvalue;
            if(!key || !value){ return callback(null, false); }
            return captcha.validate(key, value, callback);
        });
    };

    ContactForm.prototype.validate = function(data, callback){
        return this.fieldService.validate(data, callback);
    };

    ContactForm.prototype.sanitize = function(data){
        return this.fieldService.sanitize(data);
    };

    ContactForm.prototype._getError = function(data, message){
        var loc = this.ls.get(message);
        var err = BaseController.apiResponse(BaseController.API_FAILURE, loc, data);
        return { code: 500, content: err };
    };

    ContactForm.prototype._getSuccess = function(data, message){
        var loc = this.ls.get(message);
        var content = BaseController.apiResponse(BaseController.API_SUCCESS, loc, data);
        return { content: content };
    };

    ContactForm.getRoutes = function(callback){
        var routes = [
            {
                method: 'post',
                path: '/plugin/contact/api/contact/:action',
                auth_required: false,
                content_type: 'application/json'
            }
        ];
        callback(null, routes);
    };

    return ContactForm;
};
