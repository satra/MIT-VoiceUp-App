angular.module('myProfileUpdate',[])
//============profile controlller =====================================
.controller('ProfileCtrl', function($scope, $compile,userService,irkResults) {
    userService.getUserProfileFields().then(function(response){
    var userProfile = response.profile;
    var thisUser = userProfile.profiles[userProfile.default];
    var items = thisUser.items;
    //$scope.text = thisUser.text ;
    $scope.title = thisUser.title ;
    $scope.profileDiv = '';
    for (var i = 0; i < items.length; i++) {
    $scope.profileDiv += generateProfileDiv(items[i]);  
    }
    var dynamicContent = angular.element(document.querySelector('#dynamicContent'));
    dynamicContent.append($scope.profileDiv);
    $compile(dynamicContent)($scope);
   });    
});