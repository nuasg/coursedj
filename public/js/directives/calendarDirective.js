var app = angular.module('dhxScheduler', []);

app.directive('dhxScheduler', function() {
  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template:'<div class="dhx_cal_navline" ng-transclude></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',

    link:function ($scope, $element, $attrs, $controller){
      // default state of the scheduler
      if (!$scope.scheduler)
        $scope.scheduler = {};
      $scope.scheduler.mode = $scope.scheduler.mode || "week";
      $scope.scheduler.date = $scope.scheduler.date || new Date(2014, 3, 20);

      // watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        scheduler.clearAll();
        scheduler.parse(collection, "json");
      }, true);

      // watch mode and date
      $scope.$watch(function(){
        return $scope.scheduler.mode + $scope.scheduler.date.toString();
      }, function(nv, ov) {
        var mode = scheduler.getState();
        if (nv.date != mode.date || nv.mode != mode.mode)
          scheduler.setCurrentView($scope.scheduler.date, $scope.scheduler.mode);
      }, true);

      // size of scheduler
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        scheduler.setCurrentView();
      });

      // styling for dhtmlx scheduler
      $element.addClass("dhx_cal_container");

      // scheduler config
      scheduler.config.first_hour = 7;
      scheduler.config.last_hour = 22;
      scheduler.config.start_on_monday = false;
      scheduler.config.dblclick_create = false;
      scheduler.config.mark_now = true;
      scheduler.config.drag_create = false;
      scheduler.config.drag_move = false;
      scheduler.config.drag_in = false;
      scheduler.config.drag_out =false;
      scheduler.config.day_date = "%l";
      scheduler.config.hour_date = "%h:%i %A";

      // init scheduler
      scheduler.init($element[0], $scope.scheduler.date, $scope.scheduler.mode);
    }
  }
});