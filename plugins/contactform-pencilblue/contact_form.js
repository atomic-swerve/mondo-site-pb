'use strict';

/**
 * Contact Form - Display a contact form on your PencilBlue site.
 * Includes an emailer service that routes submissions to a configurable inbox.
 *
 * @author Alex Curtis <alx.curtis@gmail.com>
 * @copyright 2015
 */

var SERVICES = './include/services';

module.exports = function(pb){
    var PluginService = require(SERVICES + '/plugin_service')(pb);
    var service = new PluginService();

    var ContactForm = function(){};

    ContactForm.onInstall = function(callback){
        var details = require('./details.json');
        service.onInstall(details, callback);
    };

    ContactForm.onUninstall = function(callback){
        service.onUninstall(callback);
    };

    ContactForm.onStartup = function(callback){
        service.onStartup(callback);
    };

    ContactForm.onShutdown = function(callback) {
        callback(null, true);
    };

    return ContactForm;
};
