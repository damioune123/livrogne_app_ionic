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
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
                        }
                    }
                }
            })
            .state('app.dashBoard', {
                url: '/dashBoard',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dashBoard.html',
                        controller: 'DashboardCtrl'
                    },
                    'fabContent': {
                        template: '<button id="fab-logout"  ng-click="logout()" class="button button-fab button-fab-top-left expanded spin button-default-ios button-ios-light button-default-ios button-ios-light"><i class="icon ion-log-out"></i> </button>',
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('on');
                            }, 1000);
                        }
                    }
                }
            })

            .state('app.listOrders', {
                url: '/listOrders',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/listOrders.html',
                        controller: 'ListOrderCtrl'
                    },
                    'fabContent': {
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
                        }
                    }
                }
            })
            .state('app.listMoneyFlows', {
                url: '/listMoneyFlows?type',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/listMoneyFlows.html',
                        controller: 'ListMoneyFlowCtrl'
                    },
                    'fabContent': {
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
                        }
                    }
                }
            })
            .state('app.orderDetails', {
                url: '/orderDetails?orderId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/orderDetails.html',
                        controller: 'OrderDetailsCtrl'
                    },
                    'fabContent': {
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
                        }
                    }
                }
            })
            .state('app.moneyFlowDetails', {
                url: '/moneyFlowDetails?moneyFlowId&type',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/moneyFlowDetails.html',
                        controller: 'MoneyFlowDetailsCtrl'
                    },
                    'fabContent': {
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
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
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
                        }
                    }
                }
            })

            .state('app.moneyFlow', {
                url: '/money-flow',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/money_flow.html',
                        controller: 'MoneyFlowCtrl'
                    },
                    'fabContent': {
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
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
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
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
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
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
                        controller: function($timeout) {
                            $timeout(function() {
                                document.getElementById('fab-logout').classList.toggle('off');
                            }, 0);
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

