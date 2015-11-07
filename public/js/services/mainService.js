// js/services/mainService.js

var app = angular.module('mainService', []);

app.factory('ASG', function($http, $location){
	if ($location.$$host === 'localhost') {
		var NOT_A_KEY = "P2VVnfB0PwGQpdqh"; //DEBUG
	} else {
		var NOT_A_KEY = "aSjUsc00dvwfNZ9E"; //LIVE
	}
	return{
		getSubjects: function(term){
			return $http.get('http://api.asg.northwestern.edu/subjects/?key=' + NOT_A_KEY+ '&term=' + term);
		},
		getCourses: function(term, subject){
			return $http.get('http://api.asg.northwestern.edu/courses/?key=' + NOT_A_KEY + '&term=' + term + '&subject=' + subject);
		}
	};
});
