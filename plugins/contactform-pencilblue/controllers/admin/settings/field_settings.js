'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);
    var FieldService = require('../../../include/services/field_service')(pb);

    var SecurityService = pb.SecurityService;

    var FieldSettings = function(){
        this.service = new FieldService();
    };

    pb.util.inherits(FieldSettings, Settings);

    FieldSettings.prototype.getPageSettings = function(callback){
        this.service.getSettings(callback);
    };

    FieldSettings.prototype.getTemplate = function(){
        return '/admin/settings/field_settings';
    };

    FieldSettings.prototype.getPills = function(){
        return this._getPills('field_settings');
    };

    FieldSettings.prototype.getNavLevel = function(){
        return ['contact_form', 'field_settings'];
    };

    FieldSettings.getRoutes = function(callback){
        var routes = [
            {
                method: 'get',
                path: '/admin/plugins/contactform-pencilblue/settings/fields',
                auth_required: true,
                access_level: SecurityService.ACCESS_EDITOR,
                content_type: 'text/html'
            }
        ];
        callback(null, routes);
    };

    return FieldSettings;
};
