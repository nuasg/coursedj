// js/controllers/mainCtrl.js

var app = angular.module('mainController', []);

app.controller('mainController', function($scope, ASG) {
	// Debug helper--allows access to $scope from console;
	window.MY_SCOPE = $scope;

	/*
	 * API CODE
	 * This code is responsible for hitting the API and storing "raw" course data
	 */
	$scope.noCourses = false;

	ASG.getTerms()
		.success(function(data) {
			$scope.terms = data;
			$scope.selectedTerm = $scope.terms[0];
		})
		.error(function(err) {
			console.log(err);
		});

	// Refresh SUBJECTS on TERM change
	$scope.$watch('selectedTerm', function() {
		if (!$scope.selectedTerm) return;

		ASG.getSubjects($scope.selectedTerm.id)
			.success(function(data) {
				$scope.subjects = data;
				$scope.selectedSubject = null;

				// we can't have courses if we don't know subjects, so clear them
				$scope.courses = null;
				$scope.selectedCourse = null;

			})
			.error(function(err) {
				console.log(err);
			});
	});

	// Refresh COURSES on SUBJECT change
	$scope.$watch('selectedSubject', function() {
		if (!$scope.selectedSubject) return;

		ASG.getCourses($scope.selectedTerm.id, $scope.selectedSubject.symbol)
			.success(function(data) {
				// corner case for subjects with no courses
				if (data.length === 0) {
					$scope.noCourses = true;
					return;
				}
				$scope.noCourses = false;

				// arrange the data into a hash table, with the course subject and number as the key (i.e. "EECS 110-0")
				var coursesBySubjNum = {};
				for (var i = 0; i < data.length; i++) {
					var key;
					if (data[i].topic) {
						key = data[i].subject + " " + data[i].catalog_num + "-" + data[i].section + ": " + data[i].topic;
					} else {
						key = data[i].subject + " " + data[i].catalog_num + ": " + data[i].title;	// "EECS 110-0"
					}

					coursesBySubjNum[key] = coursesBySubjNum[key] || [];
					coursesBySubjNum[key].push(data[i]);
				}
				$scope.courses = coursesBySubjNum;

			})
			.error(function(err) {
				console.log(err);
			});
	});

	/*
	 * SCHEDULING CODE
	 * This code is responsible for letting users add courses to their cart, as well as maintaining a list of possibilities
	 */
	$scope.cart = [];
    $scope.discussions = {};
	$scope.addToCart = function(selectedCourse) {
		$scope.cart.push(selectedCourse);
	};
    
    $scope.addToDiscussionCart = function(isChecked,discussion_section, section_id,selectedDiscussion) {
        if(isChecked){

            if(section_id in $scope.discussions){
                var arr = $scope.discussions[section_id];
                arr.push(selectedDiscussion);
                $scope.discussions[section_id] = arr;
            } else {
                 $scope.discussions[section_id] = [selectedDiscussion];
            }
        } else {
            var arr = $scope.discussions[section_id];
            for(var i = 0; i < arr.length; i++) {
                section = arr[i];
                if(section.section == discussion_section){
                    arr.splice(arr.indexOf(section),1); 
                }
            $scope.discussions[section_id] = arr;

            }
        }
        console.log($scope.discussions);

	};
    
	$scope.removeFromCart = function(course){
		var i = arrayContains($scope.cart, course);
		if (i !== false){
			$scope.cart.splice(i, 1);
		}
	};
    
	function hasAllTimeInfo(course) {
		return course.meeting_days !== null && course.start_time !== null && course.end_time !== null;
	}






	// some constants
	var COLORS = [
		"green",
		"blue",
		"purple",
		"orange",
		"grey"
	];

	$scope.events = [];
	$scope.courseCount = 4;
	$scope.conflict = false;



	// Check if an array is empty
	$scope.isEmptyArray = function(arr){
		return (arr === undefined || arr.length < 1);
	};

	// Special handling for classes such as 395 and 495
	$scope.courseName = function(course) {
		if (course.topic) {
			return course.topic;
		} else {
			return course.title;
		}
	};

	// Process the selected courses and display the results
	$scope.remix = function(){
		$scope.conflict = false;

		$scope.events = [];
		var chosenDates = scramble($scope.setList);

		for (var i=0; i<chosenDates.length; i++){
			var title = chosenDates[i].subject + " " + chosenDates[i].catalog_num;
			var days = parseDays(chosenDates[i].meeting_days);
			var clr = COLORS[i];
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

	// Chance 24-hour times to 12-hour format
	$scope.reduceHour = function(str){
		if (str !== null){
			var hour = parseInt(str.substring(0, 2), 10);
			if (hour > 12)
				hour -= 12;
			var newStr = hour.toString() + str.substring(2, 5);
			return newStr;
		}else{
			return 'n/a';
		}
	};

	// Get last name of an instructor
	$scope.lastName = function(name){
		if (name){
			var names = name.split(" ");
			return names[names.length-1];
		}else{
			return "Staff";
		}
	};

	$scope.handleEvent = function(ev){
		if ($scope.setList.length > 0 && ev.charCode == 13){
			$scope.remix();
		}else if(ev.charCode == 13){
			alert("You haven't chosen any courses yet! Select some classes then try again!");
		}
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
		chosenDates.sort(function(a, b){return b.priority - a.priority;});
		chosenDates = chosenDates.slice(0, $scope.courseCount);

		for (i=0; i<mandatoryCourses.length; i++){
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
  	if (str !== null){
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
				return new Date(2014, 03, 20, 0, 0);
  	}
  }

  // Calculate if two courses conflict
  function conflicted(course1, course2){
  	return (shareDays(course1, course2) && (course1.start_time <= course2.end_time && course1.start_time >= course2.start_time ||
	    course2.start_time <= course1.end_time && course2.start_time >= course1.start_time ||
	    course1.start_time <= course2.start_time && course1.end_time >= course2.end_time ||
	    course2.start_time <= course1.start_time && course2.end_time >= course1.end_time));
  }

});
