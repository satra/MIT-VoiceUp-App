angular.module('starter.controllers', [])

//=========Configuration to bring up the loader on hive when there is a web service call
.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })
})

//======Show loader and hide on $scope Done
.run(function($rootScope, $ionicLoading) {
  $rootScope.$on('loading:show', function() {
    // $ionicLoading.show({template: 'Loading data..'})
  })
  $rootScope.$on('loading:hide', function() {
    //  $ionicLoading.hide()
  })
})
