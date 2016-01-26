// js/services/mainService.js

var app = angular.module('mainService', []);

app.factory('ASG', function($http, $location) {
	var NOT_A_KEY;
	if ($location.$$host === 'localhost') {
		NOT_A_KEY = "P2VVnfB0PwGQpdqh"; // DEBUG
	} else {
		NOT_A_KEY = "aSjUsc00dvwfNZ9E"; // LIVE
	}
	return {
		getSubjects: function(term){
			return $http.get('http://api.asg.northwestern.edu/subjects/?key=' + NOT_A_KEY+ '&term=' + term);
		},
		getCourses: function(term, subject){
			return $http.get('http://api.asg.northwestern.edu/courses/details/?key=' + NOT_A_KEY + '&term=' + term + '&subject=' + subject);
		},
		getTerms: function() {
			return $http.get('https://api.asg.northwestern.edu/terms?key=' + NOT_A_KEY);
		}
	};
});
