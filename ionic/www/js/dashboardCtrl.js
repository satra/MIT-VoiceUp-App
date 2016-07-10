
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('dashboard', [])

  // calender
.controller("dashboardCtrl", function($scope,$ionicHistory,$state,$rootScope,$http,surveyDataManager,$cordovaSQLite,databaseManager) {

	// == take user to home screeen
  $scope.switchUser = function (){
          $ionicHistory.clearCache().then(function(){
          $rootScope.emailId = null;
          $state.transitionTo('home');
          });
  }

	$http.get('assets/results_example_20160523091534.json').then(function (res) {
  var chartData = res.data;
  var dataArray= new Array();

  //graph1
   for(var i=0;i<chartData.results.sections.length;i++)
   {
		 var datad = chartData.results.sections[i][0] ;
  	 $scope.labels = datad.labels;
		 //dataArray.push(datad.data);
for(var j=0;j<datad.data.length;j++)
{
  //console.log(datad.data[j])
  dataArray.push(datad.data[j]);
}
    //  console.log(datad.data);
		 $scope.series = datad.series ;

	 $scope.data = dataArray;
}
	 var chartData = res.data;
	var dataArray= new Array();
	 //graph2
		for(var i=0;i<chartData.results.sections.length;i++)
		{
		 var datad = chartData.results.sections[i][1] ;
		 $scope.labels1 = datad.labels;
		 dataArray.push(datad.data);
		// console.log(datad);
		 $scope.series1 = datad.series ;
	 }
	 $scope.data1 = dataArray;

   //graph3
   var chartData = res.data;

  var dataArray= new Array();

    for(var i=0;i<chartData.results.sections.length;i++)
    {
     var datad = chartData.results.sections[i][2] ;
     $scope.labels2 = datad.labels;
     dataArray.push(datad.data);
     //console.log(datad.data);
     $scope.series2 = datad.series ;
   }
   $scope.data2 = dataArray;
     //graph4
var chartData = res.data;
var dataArray= new Array();

 for(var i=0;i<chartData.results.sections.length;i++)
 {
   var datad = chartData.results.sections[i][3] ;
   $scope.labels3 = datad.labels;
   //dataArray.push(datad.data);
for(var k=0;k<datad.data.length;k++)
{
//console.log(datad.data[j])
dataArray.push(datad.data[k]);
}
  //  console.log(datad.data);
   $scope.series3 = datad.series ;

 $scope.data3 = dataArray;
 //console.log( $scope.data3 );
}
      //graph5
var chartData = res.data;
var dataArray= new Array();
var labelArray= new Array();
var seriesArray= new Array();
 for(var i=0;i<chartData.results.sections.length;i++)
 {
var chartd = chartData.results.sections[i][4] ;
  $scope.labels4 = chartd.labels;
  dataArray.push(chartd.data);
  $scope.series4 = chartd.series;
  labelArray.push(chartd.labels);
  seriesArray.push(chartd.series);
//  console.log(chartd.labels);

}

$scope.data4 = dataArray;
$scope.labels4 = labelArray;
$scope.series4 = seriesArray;
console.log(dataArray,labelArray,seriesArray);
});
    // calander//
$scope.options = {
    defaultDate:  new Date(),
    minDate: "2015-01-01",
    maxDate: "2050-12-31",
    disabledDates: [
        "2015-06-22",
        "2015-07-27",
        "2015-08-13",
        "2015-08-15"
    ],
    dayNamesLength: 1, // 1 for "M", 2 for "Mo", 3 for "Mon"; 9 will show full day names. Default is 1.
    mondayIsFirstDay: true,//set monday as first day of week. Default is false
    eventClick: function(date) { // called before dateClick and only if clicked day has events
      console.log(date);
    },
    dateClick: function(date) { // called every time a day is clicked
      console.log(date);
    },
    changeMonth: function(month, year) {
      console.log(month, year);
    },
    filteredEventsChange: function(filteredEvents) {
      console.log(filteredEvents);
    },
  };

	$scope.events = [];
	surveyDataManager.getSurveyDates().then(function(res){
									var dateData = res;
									var eventsArray = new Array();
									for (var i =0; i<res.length;i++)
									  {
										eventsArray.push({"date":res.item(i).creationDate});
								 }
								$scope.events = eventsArray;
								console.log($scope.events);
	 });


});

// calander ends here
    // calander Widget//
