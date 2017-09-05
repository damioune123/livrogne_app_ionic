angular.module('livrogne-app.controllers', [])
    .controller('AppCtrl', function ($scope, $state,SocketService,RfidService,$rootScope, $ionicModal, $ionicHistory, $ionicPopup, $ionicPopover, $timeout, AuthService, UserService, AUTH_EVENTS, USER_ROLES,$q,$ionicLoading) {
        $scope.isExpanded = false;
        $scope.hasHeaderFabLeft = false;
        $scope.hasHeaderFabRight = false;

        $scope.showPrivilege = function (privilege) {
            if (window.localStorage.role === USER_ROLES.user) {
                if (privilege === USER_ROLES.admin) {
                    return false;
                }
                else if (privilege === USER_ROLES.super_admin) {
                    return false;
                }
            }
            if (window.localStorage.role === USER_ROLES.admin) {
                if (privilege === USER_ROLES.admin) {
                    return true;
                }
                else if (privilege === USER_ROLES.super_admin) {
                    return false;
                }
            }
            if (window.localStorage.role === USER_ROLES.barman) {
                if (privilege === USER_ROLES.barman) {
                    return true;
                }
                else if (privilege === USER_ROLES.super_admin) {
                    return false;
                }
                else if (privilege === USER_ROLES.admin) {
                    return false;
                }
            }

            if (window.localStorage.role === USER_ROLES.super_admin) {
                if (privilege === USER_ROLES.admin) {
                    return true;
                }
                else if (privilege === USER_ROLES.super_admin) {
                    return true;
                }
            }
        };
        $scope.colourClass = function (number) {
            if (number >= 0) {
                return "postiive";
            }
            else {
                return "negative";
            }
        };
        var navIcons = document.getElementsByClassName('ion-navicon');
        for (var i = 0; i < navIcons.length; i++) {
            navIcons.addEventListener('click', function () {
                this.classList.toggle('active');
            });
        }

        $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
            AuthService.logout();
            $state.go('app.login');
            var alertPopup = $ionicPopup.alert({
                title: 'Session finie !',
                template: 'Désolé, vous devez vous connecter à nouveau.'
            });
        });

        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.logout = function () {
            AuthService.logout();
            $ionicHistory.clearCache().then(function () {
                setTimeout(function () {
                    $state.go('app.login');
                }, 0);
            });

        };

        $scope.valAbs = function (number) {
            return Math.abs(number);
        };

        ////////////////////////////////////////
        // Layout Methods
        //////////////////////////////////////

        $scope.hideNavBar = function () {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
        };

        $scope.showNavBar = function () {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
        };

        $scope.noHeader = function () {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };

        $scope.setExpanded = function (bool) {
            $scope.isExpanded = bool;
        };

        $scope.setHeaderFab = function (location) {
            var hasHeaderFabLeft = false;
            var hasHeaderFabRight = false;

            switch (location) {
                case 'left':
                    hasHeaderFabLeft = true;
                    break;
                case 'right':
                    hasHeaderFabRight = true;
                    break;
            }

            $scope.hasHeaderFabLeft = hasHeaderFabLeft;
            $scope.hasHeaderFabRight = hasHeaderFabRight;
        };

        $scope.hasHeader = function () {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (!content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };

        $scope.hideHeader = function () {
            $scope.hideNavBar();
            $scope.noHeader();
        };

        $scope.showHeader = function () {
            $scope.showNavBar();
            $scope.hasHeader();
        };

        $scope.clearFabs = function () {
            var fabs = document.getElementsByClassName('button-fab');
            if (fabs.length && fabs.length > 1) {
                fabs[0].remove();
            }
        };
        $scope.getPersonnalAccount = function (accounts) {
            for (var i = 0; i < accounts.length; i++) {
                if (accounts[i].type === "somebody") {
                    return accounts[i];
                }
            }
        };
        SocketService.socketListennerAuth();


    })


    .controller('LoginCtrl', function ($scope, $state, $timeout, $ionicPopup, AuthService, $ionicHistory, $http,
                                       USER_ROLES, ionicMaterialInk, UserService, UserAccountService, PromotionService,
                                       RfidService, $ionicLoading, $q) {
        $scope.data = {};

        //$state.reload();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $scope.$parent.clearFabs();
        $scope.$parent.hideHeader();
        $timeout(function () {
            $scope.$parent.hideHeader();
        }, 0);

        ionicMaterialInk.displayEffect();
        window.localStorage.clear();
        $scope.showSignIn = true;
        $scope.showSignUp = false;
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };

        $scope.showSignUpF = function () {
            $scope.showSignIn = false;
            $scope.showSignUp = true;
        };
        $scope.showSignInF = function () {
            $scope.showSignIn = true;
            $scope.showSignUp = false;
        };


        $scope.signup = function (data) {
            if (data.username1 === "" || data.firstname1 === "" || data.lastname1 === "" || data.password1 === "" || data.password2 === "" ||
                data.username1 === undefined || data.firstname1 === undefined || data.lastname1 === undefined || data.password1 === undefined || data.password2 === undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Formulaire incomplet !',
                    template: 'Tous les champs (à part l\'email) sont obligatoires.'
                });
                return;
            }
            if (data.password1 !== data.password2) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur dans le choix du mot de passe !',
                    template: 'La confirmation du mot de passe ne correspond pas !'
                });
                return;
            }
            if (data.password1.length <= 4) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe trop court!',
                    template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. '
                });
                return;
            }
            $scope.show($ionicLoading);
            UserService.postUser(data, String(data.password2)).then(function (newUser) {
                $scope.hide($ionicLoading);
                setTimeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Votre compte a été créé',
                        template: 'Bienvenue à l\'ivrogne ' + newUser.firstname
                    });
                }, 500);
                setTimeout(function (){
                    $scope.showSignInF();
                },0);

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la création du compte !',
                    template: 'Contacter un admin'
                });
            });
        };

        $scope.login = function (data) {
            $scope.show($ionicLoading);
            AuthService.login(data.username, data.password).then(function (authenticated) {

                if (authenticated.status == -1) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({

                        title: 'Erreur de connexion!',
                        template: 'Aucune connexion n\'a pu être établie avec le serveur.'
                    });
                    return;
                }
                if (authenticated.status == 400) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur de connexion!',
                        template: 'Mauvais identifiants !'
                    });
                    return;
                }
                $scope.hide($ionicLoading);
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });
                setTimeout(function () {
                    $state.go('app.dashBoard');
                }, 0);
            });
        };
    })

    .controller('DashboardCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicHistory, $timeout, UserService, UserAccountService, OrderService, MoneyFlowService,
                                          ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading) {
        //MOTIONS AND DISPLAY

        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

        ionicMaterialInk.displayEffect();
        var currentUserId = window.localStorage['userId'];
        var currentUserRole = window.localStorage['role'];
        $scope.currentUserRole = currentUserRole;
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };

        //SCOPE VARS
        $scope.username = window.localStorage['username'];
        $scope.firstName = window.localStorage['firstName'];
        $scope.lastName = window.localStorage['lastName'];
        $scope.role = window.localStorage['role'];
        $scope.moneyBalance=undefined;
        $scope.availableMoney = undefined;
        $scope.accountsShown=false;

        //SCOPE FUNCTIONS
        $scope.showAccounts = function(){
            if (!$scope.accountsShown) {
                $scope.accountsShown = true;
            } else {
                $scope.accountsShown = false;
            }
        };
        $scope.goListOrders= function(){
            $state.go('app.listOrders');
        };
        $scope.goListMoneyFlows =function(type){
            $state.go('app.listMoneyFlows', {'type': type});
        };
        $scope.goOrder =function(){
            $state.go('app.order');
        };
        $scope.goMoneyFlow =function(){
            $state.go('app.moneyFlow');
        };
        $scope.goScript =function(){
            $state.go('app.script');
        };
        $scope.goEdit =function(){
            $state.go('app.edit');
        };

        //CONTROL FUNCTIONS
        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                var userPersonnalAccount = data[0];
                $scope.moneyBalance = userPersonnalAccount.money_balance;
                if (userPersonnalAccount.money_balance >= 0) $scope.classUserPeronnalMoney = "positive";
                else $scope.classUserPeronnalMoney = "negative";
                /*if (userPersonnalAccount.godfather != undefined)
                    $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname + " " + userPersonnalAccount.user.godfather.lastname;*/
                $scope.availableBalance= userPersonnalAccount.available_balance;
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin'
                });
            });
        };
        getDetails();


    })
    .controller('ListOrderCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicHistory, $timeout, UserService, UserAccountService, OrderService, MoneyFlowService,
                                          ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading) {
        //MOTIONS AND DISPLAY

        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        ionicMaterialInk.displayEffect();
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.Reload = function() {
            $scope.orders =[];
            $scope.page=1;
            getDetails();
            getOrders();
        };


        //SCOPE VARS
        $scope.username = window.localStorage['username'];
        $scope.firstName = window.localStorage['firstName'];
        $scope.lastName = window.localStorage['lastName'];
        $scope.role = window.localStorage['role'];
        $scope.moneyBalance=undefined;
        $scope.availableMoney = undefined;
        $scope.page=1;
        $scope.orders=undefined;

        //SCOPE FUNCTIONS
        $scope.formatDate = function (date) {
            date = new Date(date);
            return "Le "+ date.getDate()+"/"+date.getMonth()+"/"+date.getYear()+" à "+date.getHours()+"h "+date.getMinutes()+"m";
        };
        $scope.showOrder = function(orderId){
            console.log(orderId);
            $state.go('app.orderDetails', {'orderId': orderId});

        };
        $scope.classOrder = function(isCancelled){
            if(!isCancelled) {
                return "button-stable";
            }
            else{
                return "icon-left ion-trash-a button-assertive";
            }
        };

        $scope.loadMore = function(argument) {
            $scope.page++;
            UserAccountService.getUserPersonnalAccountOrders($scope.page).then(function(orders){

                if (orders.length!=0) {
                    console.log($scope.orders);
                    $scope.orders = $scope.orders.concat(orders);
                    $scope.noMoreItemsAvailable = false;

                } else {
                    $scope.noMoreItemsAvailable = true;
                }
                console.log($scope.orders);
            }).finally(function() {
                $scope.$broadcast("scroll.infiniteScrollComplete");
                $scope.$broadcast('scroll.refreshComplete');
            },function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin'
                });
                }
            );
        };


        //CONTROL FUNCTIONS
        var getOrders = function(){
            UserAccountService.getUserPersonnalAccountOrders(1).then(function (orders) {
                $scope.orders = orders

            }, function (error) {
                $scope.hide($ionicLoading);
                console.log("erreur lors de la récupération des commades");
            });
        };
        getOrders();
        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                var userPersonnalAccount = data[0];
                $scope.moneyBalance = userPersonnalAccount.money_balance;
                if (userPersonnalAccount.money_balance >= 0) $scope.classUserPeronnalMoney = "positive";
                else $scope.classUserPeronnalMoney = "negative";
                /*if (userPersonnalAccount.godfather != undefined)
                 $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname + " " + userPersonnalAccount.user.godfather.lastname;*/
                $scope.availableBalance= userPersonnalAccount.available_balance;
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin'
                });
            });
        };
        getDetails();



    })

    .controller('OrderDetailsCtrl', function($scope, $stateParams, $ionicPopup, $ionicHistory, $timeout, UserService, UserAccountService, OrderService, MoneyFlowService,
                                          ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading, SocketService, $rootScope) {
        //MOTIONS AND DISPLAY

        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        ionicMaterialInk.displayEffect();
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        //SCOPE VARS
        $scope.current_role=window.localStorage.role;

        //SCOPE FUNCTIONS
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        var stopSockAdmin = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerConfirmOrderDeleteAdmin = function(orderToConfirmId){
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture d\'une carte admin...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                $scope.show($ionicLoading);
                OrderService.deleteOrder(orderToConfirmId, authtokenAndId.userId).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Commande annulée avec succès!',
                        template: 'Les comptes concernés ont été débités/crédités, vous trouverez l\'annulaton de commande dans les transferts d\'argents.'
                    });
                    $scope.order=result;
                }, function (error) {
                    console.log(error);
                    stopSockAdmin();
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'annulation la commande!',
                        template: error.data.message
                    });
                });
            })

        };

        $scope.showDeleteOrderConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Annuler une commande',
                template: 'Pour valider l\'annulation, veuillez passer une carte admin devant le lecteur'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    socketListennerConfirmOrderDeleteAdmin($stateParams.orderId);
                }
            });
        };
        var getOrder = function(){
            $scope.show($ionicLoading);
            OrderService.getOrder($stateParams.orderId).then(function (response) {
                $scope.hide($ionicLoading);
                console.log(response);
                $scope.order = response;
            },function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin'
                });
            })
        };
        getOrder();

    })
    .controller('ListMoneyFlowCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicHistory, $timeout, UserService, UserAccountService, OrderService, MoneyFlowService,
                                          ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading) {
        //MOTIONS AND DISPLAY

        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        ionicMaterialInk.displayEffect();
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.Reload = function() {
            $scope.moneyFlows =[];
            $scope.page=1;
            getDetails();
            getMoneyFlows();
        };


        //SCOPE VARS
        $scope.username = window.localStorage['username'];
        $scope.firstName = window.localStorage['firstName'];
        $scope.lastName = window.localStorage['lastName'];
        $scope.role = window.localStorage['role'];
        $scope.moneyBalance=undefined;
        $scope.availableMoney = undefined;
        $scope.page=1;
        $scope.moneyFlows=undefined;
        $scope.typeMoneyFlows=$stateParams.type;
        console.log($scope.typeMoneyFlows);

        //SCOPE FUNCTIONS
        $scope.formatDate = function (date) {
            date = new Date(date);
            return "Le "+ date.getDate()+"/"+date.getMonth()+"/"+date.getYear()+" à "+date.getHours()+"h "+date.getMinutes()+"m";
        };
        $scope.showMoneyFlow = function(moneyFlowId){
            $state.go('app.moneyFlowDetails', {'moneyFlowId': moneyFlowId,'type':$stateParams.type});
        };
        $scope.classMoneyFlow = function(isCancelled){
            if(!isCancelled) {
                return "button-stable";
            }
            else{
                return "icon-left ion-trash-a button-assertive";
            }
        };

        $scope.loadMore = function(argument) {
            $scope.page++;
            if($scope.typeMoneyFlows==="positive"){
                UserAccountService.getUserPersonnalAccountPositiveMoneyFlows($scope.page).then(function(moneyFlows){

                    if (moneyFlows.length!=0) {
                        console.log($scope.moneyFlows);
                        $scope.moneyFlows = $scope.moneyFlows.concat(moneyFlows);
                        $scope.noMoreItemsAvailable = false;

                    } else {
                        $scope.noMoreItemsAvailable = true;
                    }
                    console.log($scope.moneyFlows);
                }).finally(function() {
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        $scope.$broadcast('scroll.refreshComplete');
                    },function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la récupération des informations !',
                            template: 'Contacter un admin'
                        });
                    }
                );
            }
            else{
                UserAccountService.getUserPersonnalAccountNegativeMoneyFlows($scope.page).then(function(moneyFlows){
                    if (moneyFlows.length!=0) {
                        console.log($scope.moneyFlows);
                        $scope.moneyFlows = $scope.moneyFlows.concat(moneyFlows);
                        $scope.noMoreItemsAvailable = false;

                    } else {
                        $scope.noMoreItemsAvailable = true;
                    }
                    console.log($scope.moneyFlows);
                }).finally(function() {
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        $scope.$broadcast('scroll.refreshComplete');
                    },function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la récupération des informations !',
                            template: 'Contacter un admin'
                        });
                    }
                );
            }

        };


        //CONTROL FUNCTIONS
        var getMoneyFlows = function(){
            if($scope.typeMoneyFlows==="positive"){
                UserAccountService.getUserPersonnalAccountPositiveMoneyFlows(1).then(function (moneyFlows) {
                    $scope.moneyFlows =moneyFlows;
                }, function (error) {
                    $scope.hide($ionicLoading);
                    console.log("erreur lors de la récupération des informations !");
                });
            }
            else{
                UserAccountService.getUserPersonnalAccountNegativeMoneyFlows(1).then(function (moneyFlows) {
                    $scope.moneyFlows =moneyFlows;
                }, function (error) {
                    $scope.hide($ionicLoading);
                    console.log("erreur lors de la récupération des informations !");
                });
            }

        };
        getMoneyFlows();
        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                var userPersonnalAccount = data[0];
                $scope.moneyBalance = userPersonnalAccount.money_balance;
                if (userPersonnalAccount.money_balance >= 0) $scope.classUserPeronnalMoney = "positive";
                else $scope.classUserPeronnalMoney = "negative";
                /*if (userPersonnalAccount.godfather != undefined)
                 $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname + " " + userPersonnalAccount.user.godfather.lastname;*/
                $scope.availableBalance= userPersonnalAccount.available_balance;
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin'
                });
            });
        };
        getDetails();

    })

    .controller('MoneyFlowDetailsCtrl', function($scope, $stateParams, $ionicPopup, $ionicHistory, $timeout, UserService, UserAccountService, OrderService, MoneyFlowService,
                                             ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading, SocketService, $rootScope) {
        //MOTIONS AND DISPLAY

        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        ionicMaterialInk.displayEffect();
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        //SCOPE VARS
        $scope.current_role=window.localStorage.role;
        $scope.typeMoneyFlows=$stateParams.type;

        //SCOPE FUNCTIONS
        $scope.hide = function () {
            $ionicLoading.hide();
        };

        var stopSockAdmin = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerConfirmMoneyFlowDeleteAdmin = function(moneyFlowToConfirmId){
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture d\'une carte admin...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                $scope.show($ionicLoading);
                MoneyFlowService.deleteMoneyFlow(moneyFlowToConfirmId, authtokenAndId.userId).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transfert annulé avec succès!',
                        template: 'Les comptes concernés ont été débités/crédités, vous trouverez l\'annulaton dans les transferts d\'argents.'
                    });
                    $scope.moneyFlow=result;
                }, function (error) {
                    stopSockAdmin();
                    console.log(error);
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'annulation du transfert !',
                        template: error.data.message
                    });
                });
            })

        };

        $scope.showDeleteMoneyFlowConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Annuler un Transfert',
                template: 'Pour valider l\'annulation, veuillez passer une carte admin devant le lecteur'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    socketListennerConfirmMoneyFlowDeleteAdmin($stateParams.moneyFlowId);
                }
            });
        };


        var getMoneyFlow = function(){
            $scope.show($ionicLoading);
            if($stateParams.type==="positive"){
                MoneyFlowService.getDebitMoneyFlow($stateParams.moneyFlowId).then(function (response) {
                    $scope.hide($ionicLoading);
                    console.log(response);
                    $scope.moneyFlow = response;
                },function (error) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de la récupération des informations !',
                        template: 'Contacter un admin'
                    });
                })
            }
            else{
                MoneyFlowService.getCreditMoneyFlow($stateParams.moneyFlowId).then(function (response) {
                    $scope.hide($ionicLoading);
                    console.log(response);
                    $scope.moneyFlow = response;
                },function (error) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de la récupération des informations !',
                        template: 'Contacter un admin'
                    });
                })
            }

        };
        getMoneyFlow();

    })


    .controller('OrderCtrl', function ($scope, $state, $stateParams, $ionicPopup, $ionicHistory, $timeout, PromotionService, USER_ROLES, UserService,
                                       ProductCategoryService, OrderService, MoneyFlowService, ionicMaterialMotion, ionicMaterialInk, AuthService, UserAccountService, $q, $ionicLoading) {
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        ionicMaterialInk.displayEffect();
        $scope.orderLines = [];
        $scope.users = {};
        $scope.adminPromotion = 0.0;
        $scope.simplePromotion = 0.0;
        var currentUserId = window.localStorage['userId'];
        var userPersonnalAccountId = window.localStorage["userPersonnalAccountId"];
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        var getInformation = function () {
            var promise1 = PromotionService.getPromotions();
            var promise2 = UserService.getLimitedUsers(1);
            var promise3 = ProductCategoryService.getProductCategories();
            $scope.show($ionicLoading);
            $q.all([promise1, promise2, promise3]).then(function (data) {
                var promotions = data[0];
                var users = data[1];
                var productCategories = data[2];

                for (var i = 0; i < promotions.length; i++) {
                    if (promotions[i].promotion_name == "admin") $scope.adminPromotion = promotions[i].user_promotion;
                    if (promotions[i].promotion_name == "simple") $scope.simplePromotion = promotions[i].user_promotion;
                }
                $scope.users = users;
                console.log($scope.users);
                for (var i = $scope.users.length - 1; i >= 0; i--) {
                    if (window.localStorage.userPersonnalAccountId == $scope.users[i].id)
                        $scope.users.splice(i, 1);
                    else $scope.users[i].credential = $scope.users[i].firstname + " " + $scope.users[i].lastname;
                }
                console.log($scope.users);
                for (var i = 0; i < productCategories.length; i++) {
                    for (var j = 0; j < productCategories[i].products.length; j++) {
                        if (productCategories[i].products[j].name == "Autre") productCategories[i].products.selectedProduct = productCategories[i].products[j];
                    }
                }
                $scope.productCategories = productCategories;
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                console.log("erreur lors de la récupération du solde de l'utilisiateur");
            })
        };
        getInformation();

        var totalAdminOrderLine = function(ol){
            $price=ol.admin_price*ol.quantity;
            $price = $price - (($scope.adminPromotion/100)*$price);
            return $price;
        };
        var totalUserOrderLine = function(ol){
            $price=ol.user_price*ol.quantity;
            $price = $price - (($scope.simplePromotion/100)*$price);
            return $price;
        };
        var computeOrderTotal = function () {
            $scope.totalAdmin=0.0;
            $scope.totalUser=0.0;
            for (var k = 0; k < $scope.orderLines.length; k++) {
                $scope.totalAdmin+=$scope.orderLines[k].totalAdmin;
                $scope.totalUser+=$scope.orderLines[k].totalUser;
            }

        };
        $scope.addNewOrderLine = function (pc, selectedProduct) {
            var newOrder = true;
            for (var k = 0; k < $scope.orderLines.length; k++) {
                if ($scope.orderLines[k].pc.id == pc.id && $scope.orderLines[k].product.barcode == selectedProduct.barcode) {
                    $scope.orderLines[k].quantity++;
                    $scope.orderLines[k].totalAdmin=totalAdminOrderLine($scope.orderLines[k]);
                    $scope.orderLines[k].totalUser=totalUserOrderLine($scope.orderLines[k]);
                    computeOrderTotal();
                    newOrder=false;
                    break;

                }
            }
            if(newOrder){
                console.log(selectedProduct);
                var orderLine = {pc: pc, product: selectedProduct, quantity: 1, user_price: selectedProduct.price_with_promotion_user, admin_price: selectedProduct.price_with_promotion_admin};
                orderLine.totalAdmin=totalAdminOrderLine(orderLine);
                orderLine.totalUser=totalUserOrderLine(orderLine);
                $scope.orderLines.push(orderLine);
                computeOrderTotal();
            }
        };

        $scope.removeOrderLine = function (pcId, productBarcode) {
            for (var k = 0; k < $scope.orderLines.length; k++) {
                if ($scope.orderLines[k].pc.id == pcId && $scope.orderLines[k].product.barcode == productBarcode) {
                    $scope.orderLines[k].quantity--;
                    if ($scope.orderLines[k].quantity == 0) $scope.orderLines.splice(k, 1);
                }
            }
            computeOrderTotal();
        };

        $scope.persistOrder = function (type, client) {

            if(type=="someoneElse"){
                if(client.role==="ROLE_USER"){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Passer une commande',
                        template: 'Etes-vous sûr de vouloir passer la commande pour un total de ' + $scope.totalUser + ' € ?'
                    });
                }
                else{
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Passer une commande',
                        template: 'Etes-vous sûr de vouloir passer la commande pour un total de ' + $scope.totalAdmin+ ' € ?'
                    });
                }
            }
            else if(type=="self"){
                if(currentUserRole!="ROLE_USER"){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Passer une commande',
                        template: 'Etes-vous sûr de vouloir passer la commande pour un total de ' + $scope.totalAdmin+ ' € ?'
                    });
                }
                else{
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Passer une commande',
                        template: 'Etes-vous sûr de vouloir passer la commande pour un total de ' + $scope.totalUser + ' € ?'
                    });
                }
            }
            else{
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Passer une commande',
                    template: 'Etes-vous sûr de vouloir passer la commande pour un total de ' + $scope.totalUser + ' € ?'
                });
            }

            confirmPopup.then(function (res) {
                if(!res){
                    return;
                }
                var ol = [];
                for (var k = 0; k < $scope.orderLines.length; k++) {
                    var l = {};
                    l.product = $scope.orderLines[k].product.barcode;
                    l.quantity = $scope.orderLines[k].quantity;
                    ol[k] = l;
                }
                if (type == "self") {
                    $scope.show($ionicLoading);
                    OrderService.addSelfOrder(ol).then(function (result) {
                        $scope.hide($ionicLoading);
                        if(result.INSUFFICIENT_CASH==true){
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sole disonible insuffisant !',
                                template: 'Solde disponible :'+result.available_balance+"€. Total commande :"+result.order_total+"€"
                            });
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Commande réalisée avec succès !',
                                template: ''
                            });
                        }

                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                        });


                    });
                }
                else if (type == "someoneElse") {
                    $scope.show($ionicLoading);
                    console.log(client);
                    OrderService.addSEOrder(client.user_accounts[0].id, ol).then(function (result) {
                        $scope.hide($ionicLoading);
                        if(result.INSUFFICIENT_CASH==true){
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sole disonible insuffisant !',
                                template: 'Solde disponible :'+result.available_balance+"€. Total commande :"+result.order_total+"€"
                            });
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Commande réalisée avec succès !',
                                template: ''
                            });
                        }
                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                        });
                    });

                }
                else {
                    $scope.show($ionicLoading);
                    OrderService.addCashOrder( ol).then(function (result) {
                        $scope.hide($ionicLoading);
                        if(result.INSUFFICIENT_CASH==true){
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sole disonible insuffisant !',
                                template: 'Solde disponible :'+result.available_balance+"€. Total commande :"+result.order_total+"€"
                            });
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Commande réalisée avec succès !',
                                template: ''
                            });
                        }
                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                        });
                    });
                }
                $scope.orderLines = [];
                getInformation();
            })
        };
        $scope.isSelected = function (productName) {
            if (productName == "Autre") return "selected";
        };




    })

    .controller('MoneyFlowCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService, ProductCategoryService, MoneyFlowService, AuthService,
                                           ionicMaterialMotion, ionicMaterialInk, USER_ROLES, $ionicLoading, $q) {
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };

        ionicMaterialInk.displayEffect();

        $scope.users = {};
        var getLimitedUsers = function () {
            $scope.show($ionicLoading);
            UserService.getLimitedUsers(1).then(function (result) {
                $scope.users = result;
                for (var i = $scope.users.length - 1; i >= 0; i--) {
                    if (window.localStorage.userPersonnalAccountId == $scope.users[i].id)
                        $scope.users.splice(i, 1);
                    else $scope.users[i].credential = $scope.users[i].firstname + " " + $scope.users[i].lastname;
                }
                $scope.hide($ionicLoading);
            },function(error){
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du chargement des inforamtons',
                    template: ''
                });
            });
        };

        getLimitedUsers();

        $scope.persistMoneyFlow = function (debitAccountId, creditAccountId, value, description) {
            if (isNefew) {
                if ((currentUserMoneyBalance - value) < moneyLimit) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Désolé mais vous êtes fauché !',
                        template: 'Vous ne disposez pas d\'assez d\'argent ou de crédit sur votre compte pour effectuer le transfert'
                    });
                    return;
                }
            }
            if (value == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un montant',
                    template: ''
                });
                return;
            }
            if (value <= 0) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un montant supérieur à 0',
                    template: ''
                });
                return;
            }
            if (creditAccountId == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un compter créditeur',
                    template: ''
                });
                return;
            }
            if (debitAccountId == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un compter débiteur',
                    template: ''
                });
                return;
            }
            var confirmPopup = $ionicPopup.confirm({
                title: 'Effectuer un transfert',
                template: 'Etes-vous sûr de vouloir faire le transfert pour un montant de ' + value + ' € ?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    MoneyFlowService.postMoneyFlow(debitAccountId, creditAccountId, value, description).then(
                        function (result) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Transfert bien effectué !',
                                template: 'Type compte débiteur : ' + result.debit_user_account.type +
                                '; Type compte créditeur : ' + result.credit_user_account.type +
                                '; Montant : ' + result.value + ' €'
                            });
                            UserAccountService.getUserPersonnalAccount().then(function (currentUserPersonalAccount) {
                                currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
                            });

                        }, function (error) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Erreur lors du transfert',
                                template: 'Code:' + error.data.code
                            });
                        });
                }
            })
        }
    })
    .controller('ScriptCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService, ScriptService,
                                        ionicMaterialMotion, ionicMaterialInk, $ionicLoading) {
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');

        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Ink
        ionicMaterialInk.displayEffect();

        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.turnBarOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnBarOn().then(function () {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            });

        };

        $scope.turnBarOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnBarOff().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnFridgeOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnFridgeOn().then(function () {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            });

        };

        $scope.turnFridgeOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnFridgeOff().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };

        $scope.turnMusicOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnMusicOn().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnMusicOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnMusicOff().then(function (result) {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnLightOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnLightOff().then(function (result) {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnLightOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnLightOn().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnEcranOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnEcranOff().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnEcranOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnEcranOn().then(function (result) {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnCocktailOff = function () {
            $scope.show($ionicLoading);
            ScriptService.turnCocktailOff().then(function (result) {
                $scope.hide($ionicLoading);
            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.turnCocktailOn = function () {
            $scope.show($ionicLoading);
            ScriptService.turnCocktailOn().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.openRegister = function () {
            $scope.show($ionicLoading);
            ScriptService.openRegister().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
        $scope.closeRegister = function () {
            $scope.show($ionicLoading);
            ScriptService.closeRegister().then(function (result) {
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de l\'exécution du script!',
                    template: 'Code:' + error.data.code
                });
            })
        };
    })

    .controller('StatisticCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService,
                                           ionicMaterialMotion, ionicMaterialInk, USER_ROLES, AuthService, $q, $ionicLoading) {
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        var currentUserRole = window.localStorage['role'];

        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);


        // Set Ink
        ionicMaterialInk.displayEffect();

        $scope.totalPositiveBalance = 0;
        $scope.totalNegativeBalance = 0;
        $scope.allGodfathers = [];
        $scope.allUnsponsoredUsers = [];
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        var getAllUnsponsoredUsers = function () {
            $scope.show($ionicLoading);
            UserService.getUsers().then(function (users) {
                for (var i = users.length - 1; i >= 0; i--) {
                    if (users[i].role != USER_ROLES.user) {
                        users.splice(i, 1);
                    }
                    else if (users[i].godfather != undefined) {
                        users.splice(i, 1);
                    }
                    else {
                        users[i].totalDebt = $scope.getPersonnalAccount(users[i].user_accounts).money_balance;
                        if (users[i].totalDebt >= 0) $scope.totalPositiveBalance += users[i].totalDebt;
                        else $scope.totalNegativeBalance += users[i].totalDebt;
                        $scope.allUnsponsoredUsers = users;
                    }
                }
                $scope.hide($ionicLoading);
            });
        };

        var getGodFathers = function () {
            $scope.show($ionicLoading);
            UserService.getUsers().then(function (users) {
                $scope.allGodfathers = users;
                for (var i = $scope.allGodfathers.length - 1; i >= 0; i--) {
                    if ($scope.allGodfathers[i].role == USER_ROLES.user) {
                        $scope.allGodfathers.splice(i, 1);
                    }
                    else {
                        var totalDebt = $scope.getPersonnalAccount($scope.allGodfathers[i].user_accounts).money_balance;
                        for (var j = 0; j < $scope.allGodfathers[i].nefews.length; j++) {
                            totalDebt += $scope.allGodfathers[i].nefews[j].user_accounts[0].money_balance;
                        }
                        $scope.allGodfathers[i].totalDebt = totalDebt;
                        if (totalDebt >= 0) $scope.totalPositiveBalance += totalDebt;
                        else $scope.totalNegativeBalance += totalDebt
                    }
                }
                $scope.totalNegativeBalance = Math.abs($scope.totalNegativeBalance);
                $scope.hide($ionicLoading);
            });
        };
        if (currentUserRole != USER_ROLES.user) {
            getGodFathers();
            getAllUnsponsoredUsers();
        }


        $scope.toggleGroup = function (group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function (group) {
            return $scope.shownGroup === group;
        };

        $scope.toggleOtherGroup = function (group) {
            if ($scope.isOtherGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isOtherGroupShown = function (group) {
            return $scope.shownGroup === group;
        };


        $scope.toggleUnderGroup = function (group) {
            if ($scope.isUnderGroupShown(group)) {
                $scope.shownUnderGroup = null;
            } else {
                $scope.shownUnderGroup = group;
            }
        };
        $scope.isUnderGroupShown = function (group) {
            return $scope.shownUnderGroup === group;
        };

    })

    .controller('EditCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService,
                                      ionicMaterialMotion, ionicMaterialInk, AuthService, USER_ROLES, ProductCategoryService, PromotionService, ProductService, RfidService) {
        // Set Header
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.setHeaderFab('left');
        var currentUserId = window.localStorage['userId'];
        var currentUserRole = window.localStorage['role'];
        $scope.email = window.localStorage['email'];
        $scope.username = window.localStorage['username'];
        $scope.firstName = window.localStorage['firstName'];
        $scope.lastName = window.localStorage['lastName'];
        $scope.userId = window.localStorage['userId'];
        $scope.role = window.localStorage['role'];

        // Delay expansion
        $timeout(function () {
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
        }, 300);

        // Set Ink
        ionicMaterialInk.displayEffect();


        PromotionService.getPromotions().then(function (promotions) {

            for (var i = 0; i < promotions.length; i++) {
                if (promotions[i].promotion_name == "admin") $scope.adminPromotion = promotions[i];
                if (promotions[i].promotion_name == "simple") $scope.simplePromotion = promotions[i];
            }
        });
        $scope.simpleSponsorisedUsers = {};
        var getSimpleSponsorisedUsers = function () {
            UserService.getLimitedUsers().then(function (result) {
                $scope.simpleSponsorisedUsers = result;
                for (var i = $scope.simpleSponsorisedUsers.length - 1; i >= 0; i--) {
                    if (currentUserId == $scope.simpleSponsorisedUsers[i].id)
                        $scope.simpleSponsorisedUsers.splice(i, 1);
                    else if ($scope.simpleSponsorisedUsers[i].godfather == undefined)
                        $scope.simpleSponsorisedUsers.splice(i, 1);
                    else if ($scope.simpleSponsorisedUsers[i].role == USER_ROLES.admin || $scope.simpleSponsorisedUsers[i].role == USER_ROLES.super_admin)
                        $scope.simpleSponsorisedUsers.splice(i, 1);
                    else $scope.simpleSponsorisedUsers[i].credential = $scope.simpleSponsorisedUsers[i].firstname + " " + $scope.simpleSponsorisedUsers[i].lastname;
                }
            });
        };
        if (currentUserRole != USER_ROLES.user)
            getSimpleSponsorisedUsers();

        $scope.admins = {};

        var getAdmins = function () {
            UserService.getLimitedUsers().then(function (result) {
                $scope.admins = result;
                for (var i = $scope.admins.length - 1; i >= 0; i--) {
                    if ($scope.admins[i].role == USER_ROLES.user)
                        $scope.admins.splice(i, 1);
                    else $scope.admins[i].credential = $scope.admins[i].firstname + " " + $scope.admins[i].lastname;
                }
            });
        };
        if (currentUserRole != USER_ROLES.user)
            getAdmins();
        var getProductCategories = function () {
            ProductCategoryService.getProductCategories().then(function (productCategories) {
                $scope.productCategories = productCategories;
            });
        };
        getProductCategories();

        $scope.updateUserDetails = function (firstname, lastname, username) {
            if (firstname == "" || firstname == undefined || lastname == undefined || lastname == "" || username == undefined || username == '') {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement d\'info!',
                    template: 'Tous les champs n\'ont pas été rempli'
                });
                return;
            }
            UserService.patchUserDetails(firstname, lastname, username).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Infos changées !',
                    template: ''
                });
                window.localStorage['firstName'] = firstname;
                window.localStorage['lastName'] = lastname;
                window.localStorage['username'] = username;
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement des informations',
                    template: 'Code:' + error.data.code
                });
            });

        };
        $scope.patchPromotion = function (simplePromotionName, adminPromotionName, simplePromotionRate, adminPromotionRate) {
            if (simplePromotionName == undefined || adminPromotionName == undefined || simplePromotionRate == undefined || adminPromotionRate == undefined ||
                simplePromotionRate < 0 || adminPromotionRate < 0 || simplePromotionRate > 100 || adminPromotionRate > 100) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de réduction!',
                    template: 'Tous les champs n\'ont pas été rempli ou vous n\'avez pas entrer un nombre entre 0 et 100'
                });
                return;
            }
            PromotionService.patchPromotion(simplePromotionName, simplePromotionRate).then(function (promotion) {

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de réduction!',
                    template: 'Veuillez contacter un admin'
                });
            });
            PromotionService.patchPromotion(adminPromotionName, adminPromotionRate).then(function (promotion) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Réductions changées!',
                    template: ''
                });
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de réduction!',
                    template: 'Veuillez contacter un admin'
                });
            })
        };
        $scope.patchUserRole = function (userToPromote) {
            if (userToPromote == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement d\'info!',
                    template: 'Tous les champs n\'ont pas été rempli'
                });
                return;
            }
            var confirmPopup1 = $ionicPopup.confirm({
                title: 'Voulez vous vraiment promouvoir ' + userToPromote.firstname + ' ?',
                template: 'Cette opération est irréversible !'
            });
            confirmPopup1.then(function (res1) {
                if (res1) {
                    var confirmPopup2 = $ionicPopup.confirm({
                        title: 'Voulez vous vraiment promouvoir ' + userToPromote.firstname + ' ?',
                        template: 'Vous êtes-vraiment sûr ? !'
                    });
                    confirmPopup2.then(function (res2) {
                        if (res2) {
                            var confirmPopup3 = $ionicPopup.confirm({
                                title: 'Voulez vous vraiment promouvoir ' + userToPromote.firstname + ' ?',
                                template: 'On est d\'accord pas de regret ? !'
                            });
                            confirmPopup3.then(function (res3) {
                                if (res3) {
                                    UserService.patchUserRole(userToPromote.id).then(function (user) {
                                        UserAccountService.postCashRegisterAccount(user.id).then(function (userAccount) {
                                            var alertPopup = $ionicPopup.alert({
                                                title: 'Utilisateur promu !',
                                                template: ''
                                            });
                                        }, function (error) {
                                            var alertPopup = $ionicPopup.alert({
                                                title: 'Erreur lors de la promotion !',
                                                template: 'Veuillez contacter un admin'
                                            });

                                        });
                                    }, function (error) {
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Erreur lors de la promotion !',
                                            template: 'Veuillez contacter un admin'
                                        });
                                    });
                                }
                            })
                        }
                    });
                }
            });
        };
        $scope.patchNefewGodfather = function (nefewId, godfatherId, isNew) {
            if (nefewId == undefined || godfatherId == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement d\'info!',
                    template: 'Tous les champs n\'ont pas été rempli'
                });
                return;
            }
            if (isNew) {
                var confirmPopup1 = $ionicPopup.confirm({
                    title: 'Voulez vous vraiment effectuer le parrainage?',
                    template: "Une fois qu'un client est parrainé, il ne peut plus devenir admin !"
                });
                confirmPopup1.then(function (res1) {
                    if(!res1){
                        return;
                    }
                    UserService.patchUserGodfather(nefewId, godfatherId).then(function (nefew) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Parrain affecté !',
                            template: ''
                        });
                    }, function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de l\'affection de parrain !',
                            template: 'Veuillez contacter un admin'
                        });
                    });

                });
            }
            else {
                UserService.patchUserGodfather(nefewId, godfatherId).then(function (nefew) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Parrain affecté !',
                        template: ''
                    });
                }, function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'affection de parrain !',
                        template: 'Veuillez contacter un admin'
                    });
                });
            }


        };

        $scope.postProduct = function (productCategoryId, productName, productCodebarMan) {
            console.log("test" + productCodebarMan);
            if (productCategoryId == undefined || productName == "" || productName == undefined || productCodebarMan == undefined || productCodebarMan == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Champs incomplets !',
                    template: ''
                });
                return;
            }
            ProductService.postProduct(productCategoryId, productName, productCodebarMan).then(function (product) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Produit bien créé !',
                    template: ''
                });
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la création du produit !',
                    template: 'Veuillez contacter un admin'
                });
            })
        };

        $scope.updateUserEmail = function (email) {
            if (email == undefined || email == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Tous les champs n\'ont pas été rempli'
                });
                return;
            }
            UserService.patchUserEmail(email).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'email changé !',
                    template: ''
                });
                window.localStorage['email'] = email;
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de l\'email!',
                    template: 'Le champ est vide'
                });
            })
        };

        $scope.updateUserPassword = function (password1, password2) {
            if (password1 == "" || password1 == undefined || password2 == "" || password2 == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Tous les champs n\'ont pas été rempli'
                });
                return;
            }
            if (password1 != password2) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Les mots de passe de correspondent pas'
                });
                return;
            }
            if (password1.length <= 4) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe trop court!',
                    template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. '
                });
                return;
            }
            UserService.patchUserPassword(password1).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe changé !',
                    template: ''
                });

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Veuillez contacter un admin'
                });
            });
        };

        $scope.updateRfid = function () {
            var confirmPopup1 = $ionicPopup.confirm({
                title: 'Veuillez passer la carte devant le lecteur rfid',
                template: ''
            });
            confirmPopup1.then(function (res) {
                if(!res){
                    return;
                }
                RfidService.getLastRfidToMatch().then(function (rfidToMatch) {
                    if (rfidToMatch.value == undefined) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Aucune nouvelle carte détectée dans la base de donnée',
                            template: ''
                        });
                        return;
                    }
                    UserService.patchUserRfid(rfidToMatch.value).then(function () {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Carte correctement ajoutée/modifiée !',
                            template: ''
                        });
                    }, function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la modification de la carte !',
                            template: error.data.code
                        });
                    })

                });
            });

        };
        $scope.removeRfid = function () {
            var confirmPopup1 = $ionicPopup.confirm({
                title: 'Vous êtes sur le point de délier votre carte rfid de votre compte',
                template: ''
            });
            confirmPopup1.then(function (res) {
                if(!res){
                    return;
                }
                UserService.patchNullUserRfid().then(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Carte correctement déliée de votre compte !',
                        template: ''
                    });
                })
            })
        }

    });

