// js/controllers/mainCtrl.js

// Main controller- all functionality is here

var app = angular.module('mainController', []);

app.controller('mainController', function($scope, $http, ASG){
	$scope.loaded = false;
	$scope.coursesLoaded = true;
	$scope.term = 4530;
	$scope.setList = [];
	$scope.events = [];
	$scope.courseCount = 4;
	$scope.conflict = false;
	var colors = ["green", "blue", "purple", "orange", "grey"];
	
	// GET a list of subjects 
	ASG.getSubjects()
		.success(function(data){
			console.log("GET");
			$scope.subjects = data;
			$scope.loaded = true;
		})
		.error(function(err){
			console.log(err);
			$scope.loaded = true;
		});

	// When a subject is selected, GET all the courses for that given subject
	$scope.$watch('selectedSubject', function(){
		$scope.selectedCourse = false;
		if ($scope.loaded){
			$scope.coursesLoaded = false;
			ASG.getCourses($scope.term, $scope.selectedSubject.symbol)
			.success(function(data){
				console.log("GET");
				$scope.courses = data;
				$scope.coursesLoaded = true;
			})
			.error(function(err){
				console.log(err);
				$scope.courses = [];
				$scope.coursesLoaded = true;
			});
		}
	});

	// Add a course to the list of selected courses
	$scope.addToSetList = function(course){
		var i = arrayContains($scope.setList, course);
		if (i === false){
			course.priority = 1;
			hasFullInfo(course);
			$scope.setList.push(course);
			console.log(course);
		}
		$scope.selectedCourse = false;
	};

	// Remove a course from the list of selected courses
	$scope.removeFromSetList = function(course){
		var i = arrayContains($scope.setList, course);
		if (i !== false){
			$scope.setList.splice(i, 1);
		}
	};

	// Check if an array is empty
	$scope.isEmptyArray = function(arr){
		return (arr == undefined || arr.length < 1);
	};

	// Process the selected courses and display the results
	$scope.remix = function(){
		$scope.conflict = false;

		$scope.events = [];
		var chosenDates = scramble($scope.setList);

		for (var i=0; i<chosenDates.length; i++){
			var title = chosenDates[i].subject + " " + chosenDates[i].catalog_num
			var days = parseDays(chosenDates[i].meeting_days);
			var clr = colors[i];
			for (var j=0; j<days.length; j++){				
				$scope.events.push({
					text: title,
					start_date: makeDate(days[j], chosenDates[i].start_time),
					end_date: makeDate(days[j], chosenDates[i].end_time),
					color: chosenDates[i].conflicted ? "red" : clr,
				});
			}
		}

		if ($scope.conflict)
			alert("Careful! Two or more of your mandatory courses conflict");
	};

	// Mix the list of selected courses and limit them to a specified amount
	function scramble(arr){
		var chosenDates = JSON.parse(JSON.stringify(arr));
		var mandatoryCourses = [];

		for (var i=0; i<chosenDates.length; i++){
			if (chosenDates[i].priority < 10){
				chosenDates[i].priority = chosenDates[i].priority * Math.random();
			}else{
				mandatoryCourses.push(chosenDates[i]);
			}
		}
		chosenDates.sort(function(a, b){return b.priority - a.priority});
		chosenDates = chosenDates.slice(0, $scope.courseCount);

		for (var i=0; i<mandatoryCourses.length; i++){
			for (var j=0; j<mandatoryCourses.length; j++){
				if ((i != j) && conflicted(mandatoryCourses[i], mandatoryCourses[j])) {
					$scope.conflict = true;
					mandatoryCourses[i].conflicted = true;
					mandatoryCourses[j].conflicted = true;
				}
			}
		}

		return chosenDates;
	}

	// take a string "MoWeFr" and returns an array of the dates ["Mo", "We", "Fr"]
  function parseDays(str){
  	var days = [];
  	if (str != null){
	  	var length = str.length;
	  	for (var i=0; i<str.length; i+=2){
	  		days.push(str.substring(i, i+2));
	  	}
	  }
  	return days;
  }

  // Check if two courses share days with each other (for calculating conflicts)
  function shareDays(course1, course2){
  	var days1 = parseDays(course1.meeting_days);
  	var days2 = parseDays(course2.meeting_days);
  	for (var i=0; i < days1.length; i++){
  		for (var j=0; j < days2.length; j++){
  			if (days1[i] == days2[j]){
  				return true; // Return true if a shared day exists
  			}
  		}
  	}

  	return false; // Else return false
  }

  // Check if an object is in an array, return index of the object if true
  function arrayContains(arr, obj){
  	for (var i=0; i < arr.length; i++){
  		if (arr[i] == obj){
  			return i;
  		}
  	}
  	return false;
  }

  // Return a date object in the week of 4/20/2014 based on a string input
  function makeDate(dayString, time){
  	var hour = time.substring(0, 2);
  	var min = time.substring(3, 5);
  	switch (dayString){
  		case "Su":
  			return new Date(2014, 03, 20, hour, min);
			case "Mo":
  			return new Date(2014, 03, 21, hour, min);
			case "Tu":
  			return new Date(2014, 03, 22, hour, min);
			case "We":
  			return new Date(2014, 03, 23, hour, min);
			case "Th":
  			return new Date(2014, 03, 24, hour, min);
			case "Fr":
  			return new Date(2014, 03, 25, hour, min);
			case "Sa":
  			return new Date(2014, 03, 26, hour, min);
			default: 
				return new Date(2014, 03, 20, 00, 00);
  	} 
  }

  // Calculate if two courses conflict
  function conflicted(course1, course2){
  	return (shareDays(course1, course2) && (course1.start_time <= course2.end_time && course1.start_time >= course2.start_time ||
	    course2.start_time <= course1.end_time && course2.start_time >= course1.start_time ||
	    course1.start_time <= course2.start_time && course1.end_time >= course2.end_time ||
	    course2.start_time <= course1.start_time && course2.end_time >= course1.end_time));
  }

  // Checks if a given course has specific fields defined or not
  function hasFullInfo(course){
  	if (course.meeting_days == null || course.start_time == null || course.end_time == null){
  		course.incompleteInfo = true;
  		alert("Careful! The course you just added has incomplete information from the registrar and will be unable to be displayed. You may want to remove this course from your Classes Added to not throw off your results.");
  	}
  }

});
