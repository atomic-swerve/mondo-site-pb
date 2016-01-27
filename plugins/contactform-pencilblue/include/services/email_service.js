'use strict';

module.exports = function(pb){

    var Settings = require('./settings')(pb);

    var EmailService = function(){
        this.service = new pb.EmailService();
    };

    pb.util.inherits(EmailService, Settings);

    EmailService.prototype.getSettingsType = function(){
        return 'email';
    };

    EmailService.prototype.handle = function(data, callback){
        this.getSettings(function(err, settings){
            if(err) { return callback(err); }
            if(!settings || !settings.enabled){
                var error = new Error('email not enabled');
                return callback(error);
            }
            var context = this.build(settings, data);
            this.service.sendFromTemplate(context, callback);
        }.bind(this));
    };

    EmailService.prototype.build = function(settings, data){
        return {
            from: data.email,
            to: settings.to,
            subject: data.subject,
            replacements: data,
            template: settings.template
        };
    };

    return EmailService;
};
