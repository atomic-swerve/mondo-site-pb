'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);
    var util = pb.util;

    var CaptchaService = function(){};

    util.inherits(CaptchaService, Settings);

    CaptchaService.prototype.getSettingsType = function(){
        return 'captcha';
    };

    CaptchaService.prototype.getExternalService = function(callback){
        this.getSettings(function(err, settings){
            if(err){ return callback(err); }
            if(!settings || !settings.enabled){
                var error = new Error('captcha not enabled');
                return callback(error);
            }
            var id = settings.appId;
            var key = settings.appKey;
            var secret = settings.appSecret;
            var Captcha = require('sweetcaptcha');
            var captcha = new Captcha(id, key, secret);
            return callback(null, captcha);
        });
    };

    CaptchaService.prototype.getHtml = function(callback){
        this.getExternalService(function(err, captcha){
            if(err){ return callback(); }
            captcha.api('get_html', function(apiErr, html){
                if(apiErr){ return callback(); }
                var template = new pb.TemplateValue(html, false);
                return callback(null, template);
            });
        });
    };

    CaptchaService.prototype.validate = function(key, value, callback){
        this.getExternalService(function(err, captcha){
            if(err){ return callback(err); }
            captcha.api('check', {
                sckey: key,
                scvalue: value
            }, function(apiErr, valid){
                return callback(apiErr, valid === 'true');
            });
        });
    };

    return CaptchaService;
};
