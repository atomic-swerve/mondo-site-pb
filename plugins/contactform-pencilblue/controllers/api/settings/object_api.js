'use strict';

module.exports = function(pb){

    var CustomObjectService = require('../../../include/services/custom_object_service')(pb);

    var BaseController = pb.BaseController;
    var ApiActionController = pb.ApiActionController;
    var SecurityService = pb.SecurityService;

    var ObjectApiController = function(){};

    pb.util.inherits(ObjectApiController, ApiActionController);

    var ACTIONS = {
        type: false
    };

    ObjectApiController.prototype.getActions = function(){
        return ACTIONS;
    };

    ObjectApiController.prototype.getPostParams = function(callback){
        this.getJSONPostParams(function(err, params){
            return callback(null, params);
        });
    };

    ObjectApiController.prototype.validatePostParameters = function(action, post, callback) {
        callback(null, []);
    };

    ObjectApiController.prototype._getResponse = function(mode, data){
        var message = this.ls.get(mode) + ' ' + this.ls.get('CF_API_CREATED');
        var content = BaseController.apiResponse(BaseController.API_SUCCESS, message, data);
        return { content: content };
    };

    ObjectApiController.prototype._getError = function(error){
        var loc = this.ls.get('CF_API_ERROR_CREATING');
        var content = BaseController.apiResponse(BaseController.API_FAILURE, loc, error);
        return { code: 500, content: content };
    };

    ObjectApiController.prototype.type = function(callback) {
        var post = this.post;
        if(!post || !post.type){ return callback(this._getError()); }
        var type = post.type;
        var service = new CustomObjectService();
        service.getSettings(function(err, settings){
            if(err){ return callback(this._getError()); }
            var spec = settings.spec;
            service.createType(type, spec, function(typeErr){
                if(pb.util.isError(typeErr)){ return callback(this._getError()); }
                service.setSettings(post, function(setErr, result){
                    if(pb.util.isError(setErr)){ return callback(this._getError()); }
                    return callback(this._getResponse('CF_ADMIN_CUSTOM_OBJECTS_SETTINGS', result));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    ObjectApiController.getRoutes = function(callback) {
        var routes = [
            {
                method: 'post',
                path: '/plugin/contact/api/settings/objects/:action',
                auth_required: true,
                access_level: SecurityService.ACCESS_ADMINISTRATOR,
                content_type: 'application/json'
            }
        ];
        callback(null, routes);
    };

    return ObjectApiController;
};
