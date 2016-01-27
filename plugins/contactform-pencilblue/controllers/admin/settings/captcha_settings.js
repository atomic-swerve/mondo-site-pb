'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);
    var CaptchaService = require('../../../include/services/captcha_service')(pb);

    var SecurityService = pb.SecurityService;

    var CaptchaSettings = function(){
        this.service = new CaptchaService();
    };

    pb.util.inherits(CaptchaSettings, Settings);

    CaptchaSettings.prototype.getPageSettings = function(callback){
        this.service.getSettings(callback);
    };

    CaptchaSettings.prototype.getTemplate = function(){
        return '/admin/settings/captcha_settings';
    };

    CaptchaSettings.prototype.getPills = function(){
        return this._getPills('captcha_settings');
    };

    CaptchaSettings.prototype.getNavLevel = function(){
        return ['contact_form', 'captcha_settings'];
    };

    CaptchaSettings.getRoutes = function(callback){
        var routes = [
            {
                method: 'get',
                path: '/admin/plugins/contactform-pencilblue/settings/captcha',
                auth_required: true,
                access_level: SecurityService.ACCESS_EDITOR,
                content_type: 'text/html'
            }
        ];
        callback(null, routes);
    };

    return CaptchaSettings;
};
