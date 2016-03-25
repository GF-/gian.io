'use strict';

angular.module('gianio', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  // Angular Material design and icons
  'ngMaterial',
  'ngMdIcons',
  // Social share plugin
  '720kb.socialshare'
])

// Routes
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/front.html', controller: 'PostListCtrl'});
  $routeProvider.when('/posts/:postUrl', {templateUrl: 'partials/post-detail.html', controller: 'PostDetailCtrl'});
  $routeProvider.when('/contact', {templateUrl: 'partials/contact-form.html'});
  $routeProvider.otherwise({redirectTo: '/'});
}])


// Avoiding conflict with Handlebars, angular syntax is now {[{ this }]}
.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
})


// Angular Material theme config
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink')
    .warnPalette('red')
    .backgroundPalette('grey', {
      'default': '50',
      'hue-1': '200',
      'hue-2': '600',
      'hue-3': 'A100'
    });
})

// ng-bing-html strips some html attributes and tags, such as <video>.
// $sce documentation https://docs.angularjs.org/api/ng/service/$sce
// filter: http://stackoverflow.com/questions/18340872/how-do-you-use-sce-trustashtmlstring-to-replicate-ng-bind-html-unsafe-in-angu
.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

// Calling Ghost JSON

// Posts
.controller('PostListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get(
      ghost.url.api('posts', {
        limit: 'all'
      })
      ).success(function(data) {
      $scope.posts = data.posts;
      // NOTE: 'data.posts' instead of 'data' guarantees that we look into 'POSTS' on the JSON provided by Ghost
    });
  }])

// Post
.controller('PostDetailCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get(

        // The following should be working, but it does not. No clue why..
        // ghost.url.api('posts', {
        //   slug: 'welcome-to-ghost'
        // })

        // A working alternative, as documented here http://api.ghost.org/docs/postsslugslug
        ghost.url.api('posts/slug/' + $routeParams.postUrl)
      ).success(function(data) {
      // $http.get('post-' + $routeParams.postId + '.json').success(function(data) {
      $scope.post = data.posts[0];
      // NOTE: "data.posts[0]" because https://groups.google.com/forum/#!topic/angular/EaTWQu0wffA
    });
  }])

// Author
.controller('gianioCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get(
      ghost.url.api('users/1')
      ).success(function(data) {
      $scope.user = data.users[0];
    });
  }])


// This is a way to scroll the window on top at every route change;
// I don't use it anymore as I find a more elegant CSS solution: using blocks 100% height with overscroll: auto; no JS solutions needed.
// This solution below comes from http://www.ngroutes.com/questions/14149d0/changing-route-doesnt-scroll-to-top-in-the-new-page.html#7
// .run(["$rootScope", "$anchorScroll" , function ($rootScope, $anchorScroll) {
//   $rootScope.$on("$locationChangeSuccess", function() {
//       setTimeout($anchorScroll, 600); // It is delayed to allow the 'leave' animation to complete - otherwise there is a weird jump at the beginning of the animation
//   });
// }])
// Another way is to set ng-view autoscroll="true", but it jumps on top after the animation ends - resulting in a not nice transition


// The following is about the contact form, I use formspree

// Formspree
.controller('MailControllerAjax',function($scope, $http, $mdToast) { 

  // Form
  
  // creating a blank object to hold our form information.
  //$scope will allow this to pass between controller and view
  $scope.formData = {};
  // submission message doesn't show when page loads
  $scope.submission = false;
  // Updated code thanks to Yotam
  var param = function(data) {
        var returnString = '';
        for (var d in data){
            if (data.hasOwnProperty(d))
               returnString += d + '=' + data[d] + '&';
        }
        // Remove last ampersand and return
        return returnString.slice( 0, returnString.length - 1 );
  };
  
  // $.ajax({
  //   url: 'http://formspree.io/gianfranco.pooli@gmail.com',
  //   method: 'POST',
  //   data: $('#formspree').serialize(),
  //   dataType: 'json',
  //   beforeSend: function() {},
  //   success: function(data) { 

$scope.submitFormAjax = function() {

  $http({
    method : 'POST',
    // url : 'http://dev.gian.io/assets/php/contact-engine.php',
    url : 'http://formspree.io/gianfranco.pooli@gmail.com',
    data : param($scope.formData), // pass in data as strings
    // data: $.param({
    //     name: 'Name',
    //     email: 'mymail@gian.io',
    //     message: 'ciao'
    // }),
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    } // set the headers so angular passing info as form data (not request payload)
  })
    .success(function(data) {

      if (!data.success) {

       // // if not successful, bind errors to error variables
       // $scope.errorName = data.errors.name;
       // $scope.errorEmail = data.errors.email;
       // $scope.errorTextarea = data.errors.message;
       // $scope.errorRobotest = data.errors.robotest;
       // $scope.submissionMessage = data.messageError;
       // $scope.submission = true; //shows the error message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content("Wait, validation error")
            .position('bottom left')
            .hideDelay(3000)
            .parent('#success-toast')
        );
      } else {
       $scope.contactform.$setPristine();
       $scope.model = '';
       // if successful, bind success message to message
       // $scope.submissionMessage = data.messageSuccess;
       $scope.formData = {}; // form fields are emptied with this line
       $scope.submission = true; //shows the success message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content('Thank you! Message received :-)')
            .position('bottom left')
            .hideDelay(7000)
            .parent('#success-toast')
        );
      }
     });
   };

})


// Contact form

.controller('MailController',function($scope, $http, $mdToast) { 
  
  // Form
  
  // creating a blank object to hold our form information.
  //$scope will allow this to pass between controller and view
  $scope.formData = {};
  // submission message doesn't show when page loads
  $scope.submission = false;
  // Updated code thanks to Yotam
  var param = function(data) {
        var returnString = '';
        for (var d in data){
            if (data.hasOwnProperty(d))
               returnString += d + '=' + data[d] + '&';
        }
        // Remove last ampersand and return
        return returnString.slice( 0, returnString.length - 1 );
  };
  $scope.submitForm = function() {
    $http({
    method : 'POST',
    // url : 'http://dev.gian.io/assets/php/contact-engine.php',
    url : 'http://dev.gian.io:80/contact-engine.php',
    data : param($scope.formData), // pass in data as strings
    headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so angular passing info as form data (not request payload)
  })
    .success(function(data) {
      if (!data.success) {
       // if not successful, bind errors to error variables
       $scope.errorName = data.errors.name;
       $scope.errorEmail = data.errors.email;
       $scope.errorTextarea = data.errors.message;
       $scope.errorRobotest = data.errors.robotest;
       $scope.submissionMessage = data.messageError;
       $scope.submission = true; //shows the error message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content(data.messageError)
            .position('bottom left')
            .hideDelay(3000)
            .parent('#form-message')
        );
      } else {
      // if successful, bind success message to message
       $scope.submissionMessage = data.messageSuccess;
       $scope.formData = {}; // form fields are emptied with this line
       $scope.submission = true; //shows the success message
       // wrap message in a toast
       $mdToast.show(
          $mdToast.simple()
            .content(data.messageSuccess)
            .position('bottom left')
            .hideDelay(7000)
            .parent('#success-toast')
        );
      }
     });
   };

});

