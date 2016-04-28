angular.module('myProfileUpdate',[])
//============profile controlller =====================================
.controller('ProfileCtrl', function($scope, $compile,profileDataManager,irkResults) {
    profileDataManager.getUserProfileFields().then(function(response){
    var userProfile = response;
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
