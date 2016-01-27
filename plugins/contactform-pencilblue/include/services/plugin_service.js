'use strict';

module.exports = function(pb){

    var CaptchaService = require('./captcha_service')(pb);
    var EmailService = require('./email_service')(pb);
    var CustomObjectService = require('./custom_object_service')(pb);
    var FieldService = require('./field_service')(pb);
    var Settings = require('./settings')(pb);

    var SecurityService = pb.SecurityService;

    var PluginService = function(){
        this.service = new pb.PluginService();
    };

    PluginService.prototype.onStartup = function(callback){
        this.registerGlobals();
        this.registerSettings();
        this.addAdminNav();
        callback(null, true);
    };

    PluginService.prototype.onInstall = function(details, callback){
        var settings = details.cf_settings;
        settings = settings || {};
        this.installSettings(settings, function(err){
            return callback(err, true);
        });
    };

    PluginService.prototype.onUninstall = function(callback){
        this.removeAdminNav();
        this.unRegisterSettings();
        this.removeSettings(function(err){
            callback(err, true);
        });
    };

    PluginService.prototype._navServiceCallback = function(navKey, localization, plugin){
        if(plugin.uid !== 'contactform-pencilblue'){ return []; }
        return this.getSettingsNavigation();
    };

    PluginService.prototype.registerSettings = function(){
        this.navServiceCallbackHandle = this._navServiceCallback.bind(this);
        pb.AdminSubnavService.registerFor('plugin_settings', this.navServiceCallbackHandle);
    };

    PluginService.prototype.unRegisterSettings = function(){
        pb.AdminSubnavService.unregisterFor('plugin_settings', this.navServiceCallbackHandle);
    };

    PluginService.prototype.registerGlobals = function(){
        var service = this.service;
        pb.TemplateService.registerGlobal('contact_form_stylesheet', function(flag, callback) {
            service.getSetting('stylesheet', 'contactform-pencilblue', function(err, stylesheet) {
                callback(err, stylesheet);
            });
        });
        pb.TemplateService.registerGlobal('contact_form_phone', function(flag, callback) {
            service.getSetting('show_phone', 'contactform-pencilblue', function(err, showPhone) {
                callback(err, !showPhone ? 'display: none' : '');
            });
        });
        pb.TemplateService.registerGlobal('contact_form_captcha', function(flag, callback) {
           return (new CaptchaService()).getHtml(callback);
        });
    };

    PluginService.prototype.addAdminNav = function(){
        var loc = new pb.Localization();
        pb.AdminNavigation.add({
            id: 'contact_form',
            title: loc.get('CF_ADMIN_CONTACT_FORM_SETTINGS'),
            icon: 'at',
            href: '#',
            access: SecurityService.ACCESS_ADMINISTRATOR,
            children: this.getSettingsNavigation()
        });
    };

    PluginService.prototype.getSettingsNavigation = function(){
        var loc = new pb.Localization();
        return [
            // {
            //     divider: true,
            //     id: 'field_settings',
            //     name: 'field_settings',
            //     title: loc.get('CF_ADMIN_FIELDS_SETTINGS'),
            //     icon: 'list',
            //     href: '/admin/plugins/contactform-pencilblue/settings/fields'
            // },
            {
                divider: true,
                id: 'captcha_settings',
                name: 'captcha_settings',
                title: loc.get('CF_ADMIN_CAPTCHA_SETTINGS'),
                icon: 'check-square-o',
                href: '/admin/plugins/contactform-pencilblue/settings/captcha'
            },
            {
                divider: true,
                id: 'emailer_settings',
                name: 'emailer_settings',
                title: loc.get('CF_ADMIN_EMAILER_SETTINGS'),
                icon: 'paper-plane',
                href: '/admin/plugins/contactform-pencilblue/settings/email'
            },
            {
                divider: true,
                id: 'custom_object_settings',
                name: 'custom_object_settings',
                title: loc.get('CF_ADMIN_CUSTOM_OBJECTS_SETTINGS'),
                icon: 'sitemap',
                href: '/admin/plugins/contactform-pencilblue/settings/objects'
            }
        ];
    };

    PluginService.prototype.removeAdminNav = function(){
        pb.AdminNavigation.remove('contact_form');
    };

    PluginService.prototype.installSettings = function(defaults, callback){
        pb.log.info('Installing Plugin Settings');
        var async = require('async');
        async.parallel({
            email: function(cb){
                var email = defaults.emailer;
                return this.installEmailSettings(email, cb);
            }.bind(this),
            captcha: function(cb){
                var captcha = defaults.captcha;
                return this.installCaptchaSettings(captcha, cb);
            }.bind(this),
            objects: function(cb){
                var objects = defaults.objects;
                return this.installObjectSettings(objects, cb);
            }.bind(this),
            fields: function(cb){
                var fields = defaults.fields;
                return this.installFieldSettings(fields, cb);
            }.bind(this)
        }, callback);
    };

    PluginService.prototype.installEmailSettings = function(settings, callback){
        var service = new EmailService();
        pb.log.info('Creating The Emailer Settings');
        service.setSettings(settings, callback);
    };

    PluginService.prototype.installCaptchaSettings = function(settings, callback){
        var service = new CaptchaService();
        pb.log.info('Creating The Captcha Settings');
        service.setSettings(settings, callback);
    };

    PluginService.prototype.installObjectSettings = function(settings, callback){
        var service = new CustomObjectService();
        service.setSettings(settings, function(err){
            if(err){ return callback(err); }
            pb.log.info('Creating The Custom Object Type');
            service.createType(settings.type, settings.spec, callback);
        });
    };

    PluginService.prototype.installFieldSettings = function(settings, callback){
        var service = new FieldService();
        pb.log.info('Creating The Field Settings');
        service.setSettings(settings, callback);
    };

    PluginService.prototype.removeSettings = function(callback){
        pb.log.info('Deleting Plugin Settings');
        var service = new Settings();
        service.removeAllSettings(callback);
    };

    return PluginService;
};
