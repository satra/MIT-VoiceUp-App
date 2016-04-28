angular.module('starter.services', [])
.factory('factoryList', function($http) {
	return {
		parseConsent: function(){ 
			return 'surya';
		}
	}
});