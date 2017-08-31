angular.module('livrogne-app', ['ionic', 'ionic-material', 'ionMdInput', 'livrogne-app.controllers','btford.socket-io'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);
  $stateProvider

  .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

   .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })


  .state('app.activity', {
      url: '/activity',
      views: {
          'menuContent': {
              templateUrl: 'templates/activity.html',
              controller: 'ActivityCtrl'
          },
          'fabContent': {
              template: '<button id="fab-friends"  ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
              controller: function($timeout) {
                   $timeout(function() {
                      document.getElementById('fab-friends').classList.toggle('on');
                  }, 900);
              }
          }
      }
  })

    .state('app.order', {
        url: '/order',
        views: {
            'menuContent': {
                templateUrl: 'templates/order.html',
                controller: 'OrderCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends"  ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
                controller: function($timeout) {
                     $timeout(function() {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 900);
                }
            }
        }
    })

    .state('app.money_flow', {
        url: '/money-flow',
        views: {
            'menuContent': {
                templateUrl: 'templates/money_flow.html',
                controller: 'MoneyFlowCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends"  ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
                controller: function($timeout) {
                     $timeout(function() {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 900);
                }
            }
        }
    })

    .state('app.script', {
        url: '/script',
        views: {
            'menuContent': {
                templateUrl: 'templates/script.html',
                controller: 'ScriptCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends" ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
                controller: function($timeout) {
                     $timeout(function() {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 900);
                }
            }
        }
    })

    .state('app.statistic', {
        url: '/statistic',
        views: {
            'menuContent': {
                templateUrl: 'templates/statistic.html',
                controller: 'StatisticCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends" ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
                controller: function($timeout) {
                     $timeout(function() {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 900);
                }
            }
        }
    })

    .state('app.edit', {
        url: '/edit',
        views: {
            'menuContent': {
                templateUrl: 'templates/edit.html',
                controller: 'EditCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends" ng-click="logout()" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-power"></i></button>',
                controller: function($timeout) {
                     $timeout(function() {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 900);
                }
            }
        }
    });

  $urlRouterProvider.otherwise('/app/login');
})



.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'app.login') {
        event.preventDefault();
        $state.go('app.login');
      }
    }
  });
});

