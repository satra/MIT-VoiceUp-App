cordova.define("cordova.plugins.diagnostic.api-22.Diagnostic", function(require, exports, module) {
/**
 *  Diagnostic plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic = (function(){

	/**********************
	 * Internal properties
	 *********************/
	var Diagnostic = {};

	/********************
	 * Public properties
	 ********************/



	/********************
	 * Internal functions
	 ********************/


	function ensureBoolean(callback){
		return function(result){
			callback(!!result);
		}
	}


	/**********************
	 * Public API functions
	 **********************/

	/**
	 * Checks if location is enabled.
	 * On Android, this returns true if Location Mode is enabled and any mode is selected (e.g. Battery saving, Device only, High accuracy)
	 *
	 * @param {Function} successCallback - The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if location is available for use.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isLocationEnabled = function(successCallback, errorCallback) {
		return cordova.exec(ensureBoolean(successCallback),
			errorCallback,
			'Diagnostic',
			'isLocationEnabled',
			[]);
	};

	/**
	 * Checks if location mode is set to return high-accuracy locations from GPS hardware.
	 * Returns true if Location mode is enabled and is set to either:
	 * Device only = GPS hardware only (high accuracy)
	 * High accuracy = GPS hardware, network triangulation and Wifi network IDs (high and low accuracy)
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if high-accuracy GPS-based location is available for use.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isGpsLocationEnabled = function(successCallback, errorCallback) {
		return cordova.exec(ensureBoolean(successCallback),
			errorCallback,
			'Diagnostic',
			'isGpsLocationEnabled',
			[]);
	};

	/**
	 * Checks if location mode is set to return low-accuracy locations from network triangulation/WiFi access points.
	 * Returns true if Location mode is enabled and is set to either:
	 * Battery saving = network triangulation and Wifi network IDs (low accuracy)
	 * High accuracy = GPS hardware, network triangulation and Wifi network IDs (high and low accuracy)
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if low-accuracy network-based location is available for use.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isNetworkLocationEnabled = function(successCallback, errorCallback) {
		return cordova.exec(ensureBoolean(successCallback),
			errorCallback,
			'Diagnostic',
			'isNetworkLocationEnabled',
			[]);
	};

	/**
	 * Returns the current location mode setting for the device.
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single string parameter. Values that may be passed to the success callback:
	 * "high_accuracy" - GPS hardware, network triangulation and Wifi network IDs (high and low accuracy);
	 * "device_only" - GPS hardware only (high accuracy);
	 * "battery_saving" - network triangulation and Wifi network IDs (low accuracy);
	 * "location_off" - Location is turned off
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.getLocationMode = function(successCallback, errorCallback) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'getLocationMode',
			[]);
	};

	/**
	 * Checks if Wifi is connected/enabled.
	 * On Android this returns true if the WiFi setting is set to enabled.
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if device is connected by WiFi.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isWifiEnabled = function(successCallback, errorCallback) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'isWifiEnabled',
			[]);
	};

	/**
	 * Checks if camera is present.
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if camera is present.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isCameraEnabled = function(successCallback, errorCallback) {
		Diagnostic.isCameraPresent(successCallback, errorCallback);
	};

	/**
	 * Checks if camera hardware is present on device.
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if camera is present
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isCameraPresent = function(successCallback, errorCallback) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'isCameraPresent',
			[]);
	};

	/**
	 * Checks if the device has Bluetooth capabilities and if so that Bluetooth is switched on
	 *
	 * @param {Function} successCallback -  The callback which will be called when the operation is successful.
	 * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth capabilities and Bluetooth is switched on.
	 * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
	 *  This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.isBluetoothEnabled = function(successCallback, errorCallback) {
		return cordova.exec(ensureBoolean(successCallback),
			errorCallback,
			'Diagnostic',
			'isBluetoothEnabled',
			[]);
	};

	/**
	 * Opens settings page for this app.
	 *
	 * @param {Function} successCallback - The callback which will be called when switch to settings is successful.
	 * @param {Function} errorCallback - The callback which will be called when switch to settings encounters an error.
	 * This callback function is passed a single string parameter containing the error message.
	 */
	Diagnostic.switchToSettings = function(successCallback, errorCallback) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'switchToSettings',
			[]);
	};

	/**
	 * Switches to the Location page in the Settings app
	 */
	Diagnostic.switchToLocationSettings = function() {
		return cordova.exec(null,
			null,
			'Diagnostic',
			'switchToLocationSettings',
			[]);
	};

	/**
	 * Switches to the Mobile Data page in the Settings app
	 */
	Diagnostic.switchToMobileDataSettings = function() {
		return cordova.exec(null,
			null,
			'Diagnostic',
			'switchToMobileDataSettings',
			[]);
	};

	/**
	 * Switches to the Bluetooth page in the Settings app
	 */
	Diagnostic.switchToBluetoothSettings = function() {
		return cordova.exec(null,
			null,
			'Diagnostic',
			'switchToBluetoothSettings',
			[]);
	};

	/**
	 * Switches to the WiFi page in the Settings app
	 */
	Diagnostic.switchToWifiSettings = function() {
		return cordova.exec(null,
			null,
			'Diagnostic',
			'switchToWifiSettings',
			[]);
	};

	/**
	 * Enables/disables WiFi on the device.
	 *
	 * @param {Function} successCallback - function to call on successful setting of WiFi state
	 * @param {Function} errorCallback - function to call on failure to set WiFi state.
	 * This callback function is passed a single string parameter containing the error message.
	 * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
	 */
	Diagnostic.setWifiState = function(successCallback, errorCallback, state) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'setWifiState',
			[state]);
	};

	/**
	 * Enables/disables Bluetooth on the device.
	 *
	 * @param {Function} successCallback - function to call on successful setting of Bluetooth state
	 * @param {Function} errorCallback - function to call on failure to set Bluetooth state.
	 * This callback function is passed a single string parameter containing the error message.
	 * @param {Boolean} state - Bluetooth state to set: TRUE for enabled, FALSE for disabled.
	 */
	Diagnostic.setBluetoothState = function(successCallback, errorCallback, state) {
		return cordova.exec(successCallback,
			errorCallback,
			'Diagnostic',
			'setBluetoothState',
			[state]);
	};


	/**************
	 * Constructor
	 **************/

	return Diagnostic;
});

module.exports = new Diagnostic();


});
