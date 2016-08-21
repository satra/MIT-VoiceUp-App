angular.module('customDirectives', [])
  //======================== All Directives calls for html templates ===========
  //======================================================================================
  // Usage: <btc-image-choice-question-step value="choice" text="Your choice." normal-state-image="" selected-state-image="" type="image" />
  // =====================================================================================
  .directive('customImageChoiceQuestionStep', function() {
    return {
      restrict: 'E',
      transclude: true,
      controller: ['$scope', function($scope) {
        $scope.selected = {};
      }],
      template: function(elem, attr) {
        return '<div class="irk-centered">' +
          '<div class="irk-text-centered">' +
          '<p>' + attr.title + '</p>' +
          '</div>' +
          '</div>' +
          '<div class="irk-spacer"></div>' +
          '<div class="row" ng-transclude>' +
          '</div>'
      }
    }
  })

//===== take out keyboard once they clik on enter key only issue with the android
.directive('input', function($timeout) {
  if (ionic.Platform.isAndroid()) {
    return {
      restrict: 'E',
      scope: {
        'returnClose': '=',
        'onReturn': '&'
      },
      link: function(scope, element, attr) {
        element.bind('keydown', function(e) {
          if (e.which == 13) {
            element[0].blur();
          }
        });
      }
    }
  }
})

//======================================================================================
// Usage: <btc-image-choice value="choice" text="Your choice." normal-state-image="" selected-state-image="" type="image" />
// =====================================================================================
.directive('customImageChoice', function() {
  return {
    restrict: 'E',
    require: '^?btcImageChoiceQuestionStep',
    replace: true,
    scope: true,
    template: function(elem, attr) {
      return '<div class="col irk-centered">' +
        '<button class="irk-btn-round-outline' + (attr.type == 'image' ? 'irk-image' : 'irk-icon-large icon') + ' ' + attr.normalStateImage + '">' + attr.optiontext + '</button>' +
        '</div>';
    },
    link: function(scope, element, attrs) {
      var button = element.find('button');
      button.bind('click', function() {
        //Toggle selected state of image choices
        var buttons = element.parent().find('button');
        for (i = 0; i < buttons.length; i++) {
          var choice = angular.element(buttons[i]);
          choice.removeClass('button-positive');
          var parent = choice.parent();
          choice.removeClass(parent.attr("selected-state-image"));
          choice.addClass(parent.attr("normal-state-image"));
        }

        //Set selected state
        button.removeClass(attrs.normalStateImage);
        button.addClass(attrs.selectedStateImage);
        button.addClass('button-positive');
        //save the data to cache element
        var id = element.parent().parent().attr("id");
        var value = element.attr("value");
        scope.checkEligibilitySubmitEnable(id, value);
      });
    }
  }
})

//======================================================================================
// Usage: focus-me
//===========================================

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      if (attrs.focusMeDisable === "true") {
        return;
      }
      $timeout(function() {
        element[0].focus();
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.show(); //open keyboard manually
        }
      }, 350);
    }
  }
});
