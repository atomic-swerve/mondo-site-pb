'use strict';

module.exports = function(pb){

    var CaptchaService = require('../../../include/services/captcha_service')(pb);
    var EmailService = require('../../../include/services/email_service')(pb);
    var CustomObjectService = require('../../../include/services/custom_object_service')(pb);

    var BaseController = pb.BaseController;
    var ApiActionController = pb.ApiActionController;
    var SecurityService = pb.SecurityService;

    var SettingsApiController = function(){
        this.service = new CaptchaService();
    };

    pb.util.inherits(SettingsApiController, ApiActionController);

    var ACTIONS = {
        captcha: false,
        email: false,
        objects: false
    };

    SettingsApiController.prototype.getActions = function(){
        return ACTIONS;
    };

    SettingsApiController.prototype.getPostParams = function(callback){
        this.getJSONPostParams(function(err, params){
            return callback(null, params);
        });
    };

    SettingsApiController.prototype.validatePostParameters = function(action, post, callback) {
        callback(null, []);
    };

    SettingsApiController.prototype._getResponse = function(mode, data){
        var message = this.ls.get(mode) + ' ' + this.ls.get('SAVED');
        var content = BaseController.apiResponse(BaseController.API_SUCCESS, message, data);
        return { content: content };
    };

    SettingsApiController.prototype._getError = function(error){
        var loc = this.ls.get('ERROR_SAVING');
        var content = BaseController.apiResponse(BaseController.API_FAILURE, loc, error);
        return { code: 500, content: content };
    };

    SettingsApiController.prototype.captcha = function(callback) {
        var post = this.post;
        if(!post){ return callback(this._getError()); }
        var service = new CaptchaService();
        service.setSettings(post, function(err, result){
            if(pb.util.isError(err)){ return callback(this._getError()); }
            return callback(this._getResponse('CF_ADMIN_CAPTCHA_SETTINGS', result));
        }.bind(this));
    };

    SettingsApiController.prototype.email = function(callback) {
        var post = this.post;
        if(!post){ return callback(this._getError()); }
        var service = new EmailService();
        service.setSettings(post, function(err, result){
            if(pb.util.isError(err)){ return callback(this._getError()); }
            return callback(this._getResponse('CF_ADMIN_EMAILER_SETTINGS', result));
        }.bind(this));
    };

    SettingsApiController.prototype.objects = function(callback) {
        var post = this.post;
        if(!post){ return callback(this._getError()); }
        var service = new CustomObjectService();
        service.setSettings(post, function(err, result){
            if(pb.util.isError(err)){ return callback(this._getError()); }
            return callback(this._getResponse('CF_ADMIN_CUSTOM_OBJECTS_SETTINGS', result));
        }.bind(this));
    };

    SettingsApiController.getRoutes = function(callback) {
        var routes = [
            {
                method: 'post',
                path: '/plugin/contact/api/settings/:action',
                auth_required: true,
                access_level: SecurityService.ACCESS_ADMINISTRATOR,
                content_type: 'application/json'
            }
        ];
        callback(null, routes);
    };

    return SettingsApiController;
};
