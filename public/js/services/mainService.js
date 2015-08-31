// js/services/mainService.js

var app = angular.module('mainService', []);

app.factory('ASG', function($http){

	// var NOT_A_KEY = "a3iSOsJ77pgC8BnX"; //LIVE
	var NOT_A_KEY = "P2VVnfB0PwGQpdqh"; //DEBUG
	return{
		getSubjects: function(term){
			return $http.get('http://api.asg.northwestern.edu/subjects/?key=' + NOT_A_KEY+ '&term=' + term);
		},
		getCourses: function(term, subject){
			return $http.get('http://api.asg.northwestern.edu/courses/?key=' + NOT_A_KEY + '&term=' + term + '&subject=' + subject);
		}
	}
});
