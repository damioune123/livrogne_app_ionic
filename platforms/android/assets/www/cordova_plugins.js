cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "pluginId": "com.phonegap.plugins.PushPlugin",
        "clobbers": [
            "PushNotification"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.3-dev",
    "com.phonegap.plugins.PushPlugin": "2.5.0"
};
// BOTTOM OF METADATA
});