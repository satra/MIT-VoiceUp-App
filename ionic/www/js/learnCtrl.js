angular.module('learnModule',[])
//=======Home screen controller======================
.controller('LearnCtrl', function($scope) {
      var closeDiv = angular.element(document.getElementById("headerCloseButton"));
      closeDiv.remove();
});
