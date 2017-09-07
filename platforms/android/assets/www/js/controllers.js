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


        //initial
        var w = c.width = bg.width = window.innerWidth,
            h = c.height = bg.height = window.innerHeight,
            ctx = c.getContext('2d'),
            bgCtx = bg.getContext('2d'),
            //parameters
            total = w,
            accelleration = .005,

            //afterinitial calculations
            size = w/total,
            repaintColor = 'rgba(0, 0, 0, .04)'
        colors = [],
            dots = [],
            dotsVel = [];
        var portion = 360/total;
        for(var i = 0; i < total; ++i){
            colors[i] = portion * i;
            dots[i] = h;
            dotsVel[i] = 10;
        }



        function anim(){


            window.requestAnimationFrame(anim);

            ctx.fillStyle = repaintColor;
            ctx.fillRect(0, 0, w, h);
            bgCtx.clearRect(0, 0, w, h);


            for(var i = 0; i < total; ++i){
                var currentY = dots[i] - 1;
                dots[i] += dotsVel[i] += accelleration;

                ctx.fillStyle = bgCtx.fillStyle = 'hsl('+ colors[i] + ', 80%, 50%)';
                ctx.fillRect(size * i, currentY, size, dotsVel[i] + 1);

                if(dots[i] > h && Math.random() < .01){
                    dots[i] = dotsVel[i] = 0;
                }
            }
        }
        anim();




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
                    template: 'Tous les champs (à part l\'email) sont obligatoires.',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (data.password1 !== data.password2) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur dans le choix du mot de passe !',
                    template: 'La confirmation du mot de passe ne correspond pas !',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (data.password1.length <= 4) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe trop court!',
                    template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. ',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            $scope.show($ionicLoading);
            UserService.postUser(data, String(data.password2)).then(function (newUser) {
                $scope.hide($ionicLoading);
                setTimeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Votre compte a été créé',
                        template: 'Bienvenue à l\'ivrogne ' + newUser.firstname,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }, 500);
                setTimeout(function (){
                    $scope.showSignInF();
                },0);

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la création du compte !',
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                        template: 'Aucune connexion n\'a pu être établie avec le serveur.',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if (authenticated.status == 400) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur de connexion!',
                        template: 'Mauvais identifiants !',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
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
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();
        $scope.$parent.hideHeader();

        $timeout(function () {
            $scope.$parent.hideHeader();
        }, 0);

        $scope.isExpanded = false;
        $scope.$parent.setExpanded(false);
        $scope.$parent.setHeaderFab(false);

        ionicMaterialInk.displayEffect();
        $scope.currentUserRole = window.localStorage['role'];
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.doRefresh=function(){
            getDetails();
            $scope.$broadcast('scroll.refreshComplete');

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
        $scope.goNefew =function(){
            $state.go('app.nefew');
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
                window.localStorage["userPersonnalAccountId"] = userPersonnalAccount.id;
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
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            });
        };
        if($stateParams.userBalance==undefined || $stateParams.moneyBalance==undefined){
            getDetails();
        }
        else{
            $scope.moneyBalance = $stateParams.moneyBalance;
            if ($scope.moneyBalance >= 0) $scope.classUserPeronnalMoney = "positive";
            else $scope.classUserPeronnalMoney = "negative";
            $scope.availableBalance=$stateParams.userBalance;
        }



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
        $scope.doRefresh= function() {
            $scope.orders =[];
            $scope.page=1;
            getDetails();
            getOrders();
            $scope.$broadcast('scroll.refreshComplete');
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
            return "Le "+ date.toLocaleDateString()+"  à "+date.toLocaleTimeString();
        };
        $scope.showOrder = function(orderId){
            console.log(orderId);
            $state.go('app.orderDetails', {'orderId': orderId});

        };
        $scope.classOrder = function(isCancelled){
            if(!isCancelled) {
                return "head";
            }
            else{
                return "negative";
            }
        };

        $scope.loadMore = function(argument) {
            $scope.page++;
            UserAccountService.getUserPersonnalAccountOrders($scope.page).then(function(orders){
                console.log(orders);
                $scope.orders = $scope.orders.concat(orders);

                if (orders.length!=0) {
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
                        template: 'Contacter un admin',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }
            );
        };


        //CONTROL FUNCTIONS
        var getOrders = function(){
            UserAccountService.getUserPersonnalAccountOrders(1).then(function (orders) {

                $scope.orders = orders;

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
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);
                OrderService.deleteOrder(orderToConfirmId, authtokenAndId.userId).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Commande annulée avec succès',
                        template: 'Les comptes concernés ont été débités/crédités, vous trouverez l\'annulaton de commande dans les transferts d\'argents.',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    $scope.order=result;
                }, function (error) {
                    $scope.hide($ionicLoading);
                    console.log(error);
                    stopSockAdmin();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'annulation la commande!',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
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
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
        $scope.doRefresh = function() {
            $scope.moneyFlows =[];
            $scope.page=1;
            getDetails();
            getMoneyFlows();
            $scope.$broadcast('scroll.refreshComplete');
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

        //SCOPE FUNCTIONS
        $scope.formatDate = function (date) {

            date = new Date(date);
            return "Le "+ date.toLocaleDateString()+"  à "+date.toLocaleTimeString();
        };
        $scope.showMoneyFlow = function(moneyFlowId){
            $state.go('app.moneyFlowDetails', {'moneyFlowId': moneyFlowId,'type':$stateParams.type});
        };
        $scope.classMoneyFlow = function(isCancelled){
            if(!isCancelled) {
                return "head";
            }
            else{
                return "negative";
            }
        };

        $scope.loadMore = function(argument) {
            $scope.page++;
            if($scope.typeMoneyFlows==="positive"){
                UserAccountService.getUserPersonnalAccountPositiveMoneyFlows($scope.page).then(function(moneyFlows){
                    console.log(moneyFlows);

                    $scope.moneyFlows = $scope.moneyFlows.concat(moneyFlows);

                    if (moneyFlows.length!=0 ) {
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
                            template: 'Contacter un admin',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    }
                );
            }
            else{
                UserAccountService.getUserPersonnalAccountNegativeMoneyFlows($scope.page).then(function(moneyFlows){
                    $scope.moneyFlows = $scope.moneyFlows.concat(moneyFlows);
                    if (moneyFlows.length!=0) {
                        $scope.noMoreItemsAvailable = false;

                    } else {
                        $scope.noMoreItemsAvailable = true;
                    }

                }).finally(function() {
                        $scope.$broadcast("scroll.infiniteScrollComplete");
                        $scope.$broadcast('scroll.refreshComplete');
                    },function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la récupération des informations !',
                            template: 'Contacter un admin',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
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
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);
                MoneyFlowService.deleteMoneyFlow(moneyFlowToConfirmId, authtokenAndId.userId).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transfert annulé avec succès',
                        template: 'Les comptes concernés ont été débités/crédités, vous trouverez l\'annulaton dans les transferts d\'argents.',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    $scope.moneyFlow=result;
                }, function (error) {
                    stopSockAdmin();
                    console.log(error);
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'annulation du transfert !',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
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
                        template: 'Contacter un admin',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
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
                        template: 'Contacter un admin',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                })
            }

        };
        getMoneyFlow();

    })


    .controller('OrderCtrl', function ($scope, $state, $stateParams, $ionicPopup, $ionicHistory, $timeout, PromotionService, USER_ROLES, UserService,
                                       ProductService, OrderService, MoneyFlowService, ionicMaterialMotion, ionicMaterialInk, AuthService, UserAccountService, $q, $ionicLoading) {
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
        $scope.orderLines = [];
        $scope.search_properties_users = ['firstname','lastname','role'];
        $scope.users = {};
        $scope.adminPromotion = 0.0;
        $scope.simplePromotion = 0.0;

        var getInformation = function () {
            var promise1 = PromotionService.getPromotions();
            var promise2 = UserService.getLimitedUsers();
            var promise3 = ProductService.getProducts();
            $scope.show($ionicLoading);
            $q.all([promise1, promise2, promise3]).then(function (data) {
                var promotions = data[0];
                var users = data[1];
                var products = data[2];
                console.log(users);

                for (var i = 0; i < promotions.length; i++) {
                    if (promotions[i].promotion_name == "admin") $scope.adminPromotion = promotions[i].user_promotion;
                    if (promotions[i].promotion_name == "simple") $scope.simplePromotion = promotions[i].user_promotion;
                }
                $scope.users = users;
                for (var i = $scope.users.length - 1; i >= 0; i--) {
                    if (window.localStorage.userId == $scope.users[i].id)
                        $scope.users.splice(i, 1);
                    else $scope.users[i].credential = $scope.users[i].firstname + " " + $scope.users[i].lastname;
                }

                $scope.products = products;
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
            return Math.round($price * 100) / 100;
        };
        var totalUserOrderLine = function(ol){
            $price=ol.user_price*ol.quantity;
            $price = $price - (($scope.simplePromotion/100)*$price);
            return Math.round($price * 100) / 100;
        };
        var computeOrderTotal = function () {
            $scope.totalAdmin=0.0;
            $scope.totalUser=0.0;
            for (var k = 0; k < $scope.orderLines.length; k++) {
                $scope.totalAdmin+=$scope.orderLines[k].totalAdmin;
                $scope.totalUser+=$scope.orderLines[k].totalUser;
            }
            $scope.totalAdmin = Math.round($scope.totalAdmin * 100) / 100;
            $scope.totalUser = Math.round($scope.totalUser * 100) / 100;


        };
        $scope.addNewOrderLine = function (selectedProducts) {
            var newOrder = true;
            for (var i=0; i <selectedProducts.length ; i++){
                for (var k = 0; k < $scope.orderLines.length; k++) {
                    if ($scope.orderLines[k].product.barcode == selectedProducts[i].barcode) {
                        $scope.orderLines[k].quantity++;
                        $scope.orderLines[k].totalAdmin=totalAdminOrderLine($scope.orderLines[k]);
                        $scope.orderLines[k].totalUser=totalUserOrderLine($scope.orderLines[k]);
                        computeOrderTotal();
                        newOrder=false;
                        break;

                    }
                }
                if(newOrder){
                    var orderLine = {product: selectedProducts[i], quantity: 1, user_price: selectedProducts[i].price_with_promotion_user, admin_price: selectedProducts[i].price_with_promotion_admin};
                    orderLine.totalAdmin=totalAdminOrderLine(orderLine);
                    orderLine.totalUser=totalUserOrderLine(orderLine);
                    $scope.orderLines.push(orderLine);
                    computeOrderTotal();
                }

            }

        };

        $scope.removeOrderLine = function (productBarcode) {
            for (var k = 0; k < $scope.orderLines.length; k++) {
                if ($scope.orderLines[k].product.barcode == productBarcode) {
                    $scope.orderLines[k].quantity--;
                    if ($scope.orderLines[k].quantity == 0) $scope.orderLines.splice(k, 1);
                }
            }
            computeOrderTotal();
        };

        $scope.persistOrder = function (type, client) {
            if($scope.orderLines.length==0 || $scope.orderLines==undefined){
                var alertPopup = $ionicPopup.alert({
                    title: 'Panier vide !',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });

                return;
            }

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
                if(window.localStorage.role!="ROLE_USER"){
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
                                template: 'Solde disponible :'+result.available_balance+"€. Total commande :"+result.order_total+"€",
                                buttons: [
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-default-ios'
                                    }
                                ]
                            });
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Commande réalisée avec succès',
                                template: '',
                                buttons: [
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-default-ios'
                                    }
                                ]
                            });
                        }


                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    }).finally(function(){
                        ol=undefined;
                        $scope.selectedClient=undefined;
                        $scope.selectedProducts=undefined;
                        $scope.orderLines = [];
                        $scope.totalUser=0.0;
                        $scope.totalAdmin=0.0;
                        getInformation();
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
                                template: 'Solde disponible :'+result.available_balance+"€. Total commande :"+result.order_total+"€",
                                buttons: [
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-default-ios'
                                    }
                                ]
                            });
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Commande réalisée avec succès ',
                                template: '',
                                buttons: [
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-default-ios'
                                    }
                                ]
                            });
                        }

                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    }).finally(function(){
                        ol=undefined;
                        $scope.selectedClient=undefined;
                        $scope.selectedProducts=undefined;
                        $scope.orderLines = [];
                        $scope.totalUser=0.0;
                        $scope.totalAdmin=0.0;
                        getInformation();
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
                                title: 'Commande réalisée avec succès ',
                                template: '',
                                buttons: [
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-default-ios'
                                    }
                                ]
                            });
                        }
                        $scope.selectedClient=undefined;
                        $scope.selectedProducts=undefined;
                        $scope.orderLines = [];
                        getInformation();
                    }, function (error) {
                        $scope.hide($ionicLoading);
                        console.log(error);
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de la création de la commande!',
                            template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    }).finally(function(){
                        ol=undefined;
                        $scope.selectedClient=undefined;
                        $scope.selectedProducts=undefined;
                        $scope.totalUser=0.0;
                        $scope.totalAdmin=0.0;
                        $scope.orderLines = [];
                        getInformation();
                    });
                }

            })
        };



    })

    .controller('MoneyFlowCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService, ProductCategoryService, MoneyFlowService, AuthService,
                                           ionicMaterialMotion, ionicMaterialInk, USER_ROLES, $ionicLoading, $q,SocketService,$rootScope) {
        // Set Header
        var userPersonnalAccountId = window.localStorage["userPersonnalAccountId"];
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
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.search_properties_users = ['firstname','lastname','role'];
        $scope.userPersonnalAccountId = window.localStorage["userPersonnalAccountId"]

        var stopSockAdmin = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerConfirmMoneyFlowAdmin = function(accountId,type, value, description){
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture d\'une carte admin...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);
                MoneyFlowService.postMoneyFlow(accountId,type, value, description,authtokenAndId.userId).then(function (result) {
                    $scope.hide($ionicLoading);
                    getInformation();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transfert bien effectué !',
                        template: 'Type : ' + type +
                        '; Montant : ' + result.value + ' €',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });

                }, function (error) {
                    $scope.hide($ionicLoading);
                    stopSockAdmin();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors du transfert',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                });
            })

        };

        var getInformation = function () {
            var promise1 = UserService.getLimitedUsers();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                var users = data[0];
                $scope.users=users;
                for (var i = $scope.users.length - 1; i >= 0; i--) {
                    if (window.localStorage.userId == $scope.users[i].id)
                        $scope.users.splice(i, 1);
                    else $scope.users[i].credential = $scope.users[i].firstname + " " + $scope.users[i].lastname;
                }
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des utilisateurs',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };
        getInformation();

        $scope.persistMoneyFlow = function (accountId,type, value, description) {
            console.log("qsdqjn");
            if (value == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un montant',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (value <= 0) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un montant supérieur à 0',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (accountId == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Veuillez rentrer un compter créditeur',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            socketListennerConfirmMoneyFlowAdmin(accountId,type, value, description);
        }
    })
    .controller('RedirectCtrl', function ($scope, $state,$timeout,$ionicLoading,UserAccountService,$q) {
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();

        //initial
        var w = c2.width = bg2.width = window.innerWidth,
            h = c2.height = bg2.height = window.innerHeight,
            ctx = c2.getContext('2d'),
            bgCtx = bg2.getContext('2d'),

            //parameters
            total = w,
            accelleration = .05,

            //afterinitial calculations
            size = w/total,
            repaintColor = 'rgba(0, 0, 0, .04)'
        colors = [],
            dots = [],
            dotsVel = [];

//setting the colors' hue
//and y level for all dots
        var portion = 360/total;
        for(var i = 0; i < total; ++i){
            colors[i] = portion * i;

            dots[i] = h;
            dotsVel[i] = 10;
        }

        function anim(){
            window.requestAnimationFrame(anim);

            ctx.fillStyle = repaintColor;
            ctx.fillRect(0, 0, w, h);
            bgCtx.clearRect(0, 0, w, h);

            for(var i = 0; i < total; ++i){
                var currentY = dots[i] - 1;
                dots[i] += dotsVel[i] += accelleration;

                ctx.fillStyle = bgCtx.fillStyle = 'hsl('+ colors[i] + ', 80%, 50%)';
                ctx.fillRect(size * i, currentY, size, dotsVel[i] + 1);

                if(dots[i] > h && Math.random() < .01){
                    dots[i] = dotsVel[i] = 0;
                }
            }
        }

        anim();

        $timeout(function () {
            $scope.$parent.hideHeader();
        }, 0);

        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.firstName=window.localStorage.firstName;
        $scope.lastName=window.localStorage.lastName;



        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                $scope.show($ionicLoading);
                $timeout(function () {
                    $scope.hide($ionicLoading);
                    $state.go("app.dashBoard", {"userBalance":data[0].available_balance, "moneyBalance":data[0].money_balance});
                }, 500);
            });

        };
        getDetails();


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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: error.data.message,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };
    })

    .controller('NefewCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService, ProductCategoryService, MoneyFlowService, AuthService,
                                           ionicMaterialMotion, ionicMaterialInk, USER_ROLES, $ionicLoading, $q,SocketService,$rootScope) {
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
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.doRefresh=function(){
            getDetails();
            getInformation();
            $scope.$broadcast('scroll.refreshComplete');

        };
        $scope.showNefew = function(userId){
            $state.go("app.userDetails",{"userId":userId});
        }
        $scope.search_properties_users = ['firstname','lastname','role'];

        $scope.patchGodfather= function(nefewId){
            socketListennerConfirmSponsorAdmin(nefewId);
        };
        $scope.username = window.localStorage['username'];
        $scope.firstName = window.localStorage['firstName'];
        $scope.lastName = window.localStorage['lastName'];
        $scope.role = window.localStorage['role'];
        $scope.moneyBalance=undefined;
        $scope.availableMoney = undefined;


        console.log($scope);
        var stopSockAdmin = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerConfirmSponsorAdmin= function(futureNefewId){
            console.log($scope);
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture de la carte de '+window.localStorage.firstName+' '+window.localStorage.lastName+'...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.userId!=window.localStorage.userId  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a '+window.localStorage.firstName+' '+window.localStorage.lastName+' !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);
                UserService.patchUserGodfather(futureNefewId).then(function (result) {
                    $scope.hide($ionicLoading);
                    getInformation();
                    var alertPopup = $ionicPopup.alert({
                        title: 'L\'utilisateur a bien été parrainé !',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });

                }, function (error) {
                    $scope.hide($ionicLoading);
                    stopSockAdmin();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors du parrainage',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }).finally(function() {
                    $scope.selectedNefew = undefined;
                });
            })
        };

        //CONTROL FUNCTIONS
        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                var userPersonnalAccount = data[0];
                window.localStorage["userPersonnalAccountId"] = userPersonnalAccount.id;
                $scope.moneyBalance = userPersonnalAccount.money_balance;
                /*if (userPersonnalAccount.godfather != undefined)
                 $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname + " " + userPersonnalAccount.user.godfather.lastname;*/
                $scope.availableBalance= userPersonnalAccount.available_balance;
                $scope.availableCredit= userPersonnalAccount.credit_to_allow_max-userPersonnalAccount.credit_allowed;
                $scope.creditAllowed= userPersonnalAccount.credit_allowed;

                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            });
        };
        getDetails();
        var getInformation = function () {
            var promise1 = UserService.getUnsponsoredUsers();
            var promise2 = UserService.getNefews();
            $scope.show($ionicLoading);
            $q.all([promise1, promise2]).then(function (data) {
                var unsponsoredUsers = data[0];
                var nefews = data[1];
                $scope.unsponsoredUsers=unsponsoredUsers;
                $scope.nefews = nefews;

                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des utilisateurs',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };
        getInformation();


    })

    .controller('UserDetailsCtrl', function ($scope, $state, $stateParams, $ionicPopup, $timeout, UserService, UserAccountService, OrderService, ProductCategoryService, MoneyFlowService, AuthService,
                                       ionicMaterialMotion, ionicMaterialInk, USER_ROLES, $ionicLoading, $q,SocketService,$rootScope) {
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
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };
        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.doRefresh=function(){
            getDetails();
            $scope.$broadcast('scroll.refreshComplete');

        };
        $scope.setLimit= function(value){
          socketListennerConfirmChangeLimitAdmin($scope.user.user_accounts[0].id,value);
        };
        $scope.numberPickerObject = {
            inputValue: 0, //Optional
            minValue: 0,
            maxValue: 200,
            precision: 1,  //Optional
            decimalStep: 0.5,  //Optional
            format: "DECIMAL",  //Optional - "WHOLE" or "DECIMAL"
            unit: "€",  //Optional - "m", "kg", "℃" or whatever you want
            titleLabel: 'Changer la limite de crédit du neveu',  //Optional
            setLabel: 'OK',  //Optional
            closeLabel: 'Back',  //Optional
            setButtonType: 'button-positive',  //Optional
            callback: function (val) {    //Mandatory
                $scope.setLimit(val);
            }
        };

        $scope.currentUserId=window.localStorage.userId;

        $scope.currentRole = window.localStorage['role'];

        var stopSockAdmin = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerConfirmUnsetAdmin= function(nefewId){
            console.log($scope);
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture de la carte de '+window.localStorage.firstName+' '+window.localStorage.lastName+'...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.userId!=window.localStorage.userId  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a '+window.localStorage.firstName+' '+window.localStorage.lastName+' !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);

                UserService.unsetUserGodfather(nefewId).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'L\'utilisateur a bien été retiré de la liste de vos neveux !',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });

                }, function (error) {
                    $scope.hide($ionicLoading);
                    stopSockAdmin();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors du déparrainage',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }).finally(function() {
                    getDetails();
                });

            })
        };

        var socketListennerConfirmChangeLimitAdmin= function(nefewId,value){
            console.log($scope);
            SocketService.socketOff();
            $rootScope.cancel = stopSockAdmin;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture de la carte de '+window.localStorage.firstName+' '+window.localStorage.lastName+'...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (authtokenAndId) {
                console.log(authtokenAndId);
                stopSockAdmin();
                if(authtokenAndId.rfid_to_match !=undefined){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte est vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.role!=USER_ROLES.admin  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a un admin !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                if(authtokenAndId.userId!=window.localStorage.userId  ) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'appartient pas a '+window.localStorage.firstName+' '+window.localStorage.lastName+' !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);

                UserService.patchUserMoneyLimit(nefewId,value).then(function (result) {
                    $scope.hide($ionicLoading);
                    var alertPopup = $ionicPopup.alert({
                        title: 'La limite de l\'utilisateur a bien été modifiée !',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });

                }, function (error) {
                    $scope.hide($ionicLoading);
                    stopSockAdmin();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors du changement de limite',
                        template: error.data.message,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }).finally(function() {
                    getDetails();
                });

            })
        };
        $scope.unsetGodfather = function(userId){
            socketListennerConfirmUnsetAdmin(userId);
        };

        //CONTROL FUNCTIONS
        var getDetails = function () {
            var promise1 = UserService.getUserById($stateParams.userId);
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                $scope.user=data[0];
                $scope.hide($ionicLoading);

            }, function (error) {
                $scope.hide($ionicLoading);
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la récupération des informations !',
                    template: 'Contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            });
        };
        getDetails();

    })
    .controller('RedirectCtrl', function ($scope, $state,$timeout,$ionicLoading,UserAccountService,$q) {
        $scope.$parent.showHeader();
        $scope.$parent.clearFabs();

        //initial
        var w = c2.width = bg2.width = window.innerWidth,
            h = c2.height = bg2.height = window.innerHeight,
            ctx = c2.getContext('2d'),
            bgCtx = bg2.getContext('2d'),

            //parameters
            total = w,
            accelleration = .05,

            //afterinitial calculations
            size = w/total,
            repaintColor = 'rgba(0, 0, 0, .04)'
        colors = [],
            dots = [],
            dotsVel = [];

//setting the colors' hue
//and y level for all dots
        var portion = 360/total;
        for(var i = 0; i < total; ++i){
            colors[i] = portion * i;

            dots[i] = h;
            dotsVel[i] = 10;
        }

        function anim(){
            window.requestAnimationFrame(anim);

            ctx.fillStyle = repaintColor;
            ctx.fillRect(0, 0, w, h);
            bgCtx.clearRect(0, 0, w, h);

            for(var i = 0; i < total; ++i){
                var currentY = dots[i] - 1;
                dots[i] += dotsVel[i] += accelleration;

                ctx.fillStyle = bgCtx.fillStyle = 'hsl('+ colors[i] + ', 80%, 50%)';
                ctx.fillRect(size * i, currentY, size, dotsVel[i] + 1);

                if(dots[i] > h && Math.random() < .01){
                    dots[i] = dotsVel[i] = 0;
                }
            }
        }

        anim();

        $timeout(function () {
            $scope.$parent.hideHeader();
        }, 0);

        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };
        $scope.firstName=window.localStorage.firstName;
        $scope.lastName=window.localStorage.lastName;



        var getDetails = function () {
            var promise1 = UserAccountService.getUserPersonnalAccount();
            $scope.show($ionicLoading);
            $q.all([promise1]).then(function (data) {
                $scope.show($ionicLoading);
                $timeout(function () {
                    $scope.hide($ionicLoading);
                    $state.go("app.dashBoard", {"userBalance":data[0].available_balance, "moneyBalance":data[0].money_balance});
                }, 500);
            });

        };
        getDetails();


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
                                      ionicMaterialMotion, ionicMaterialInk, AuthService, USER_ROLES, ProductCategoryService, PromotionService, ProductService, SocketService,$rootScope,$ionicLoading) {
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
        $scope.show = function () {
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
            });
        };

        $scope.hide = function () {
            $ionicLoading.hide();
        };

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
                    template: 'Tous les champs n\'ont pas été rempli',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            UserService.patchUserDetails(firstname, lastname, username).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Infos changées !',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                window.localStorage['firstName'] = firstname;
                window.localStorage['lastName'] = lastname;
                window.localStorage['username'] = username;
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement des informations',
                    template: 'Code:' + error.data.code,
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            });

        };
        $scope.patchPromotion = function (simplePromotionName, adminPromotionName, simplePromotionRate, adminPromotionRate) {
            if (simplePromotionName == undefined || adminPromotionName == undefined || simplePromotionRate == undefined || adminPromotionRate == undefined ||
                simplePromotionRate < 0 || adminPromotionRate < 0 || simplePromotionRate > 100 || adminPromotionRate > 100) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de réduction!',
                    template: 'Tous les champs n\'ont pas été rempli ou vous n\'avez pas entrer un nombre entre 0 et 100',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            PromotionService.patchPromotion(simplePromotionName, simplePromotionRate).then(function (promotion) {

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de réduction!',
                    template: 'Veuillez contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                    template: 'Veuillez contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };
        $scope.patchUserRole = function (userToPromote) {
            if (userToPromote == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement d\'info!',
                    template: 'Tous les champs n\'ont pas été rempli',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                                                template: '',
                                                buttons: [
                                                    {
                                                        text: '<b>OK</b>',
                                                        type: 'button-default-ios'
                                                    }
                                                ]
                                            });
                                        }, function (error) {
                                            var alertPopup = $ionicPopup.alert({
                                                title: 'Erreur lors de la promotion !',
                                                template: 'Veuillez contacter un admin',
                                                buttons: [
                                                    {
                                                        text: '<b>OK</b>',
                                                        type: 'button-default-ios'
                                                    }
                                                ]
                                            });

                                        });
                                    }, function (error) {
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Erreur lors de la promotion !',
                                            template: 'Veuillez contacter un admin',
                                            buttons: [
                                                {
                                                    text: '<b>OK</b>',
                                                    type: 'button-default-ios'
                                                }
                                            ]
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
                    template: 'Tous les champs n\'ont pas été rempli',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
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
                            template: '',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    }, function (error) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Erreur lors de l\'affection de parrain !',
                            template: 'Veuillez contacter un admin',
                            buttons: [
                                {
                                    text: '<b>OK</b>',
                                    type: 'button-default-ios'
                                }
                            ]
                        });
                    });

                });
            }
            else {
                UserService.patchUserGodfather(nefewId, godfatherId).then(function (nefew) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Parrain affecté !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }, function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de l\'affection de parrain !',
                        template: 'Veuillez contacter un admin',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                });
            }


        };

        $scope.postProduct = function (productCategoryId, productName, productCodebarMan) {
            console.log("test" + productCodebarMan);
            if (productCategoryId == undefined || productName == "" || productName == undefined || productCodebarMan == undefined || productCodebarMan == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Champs incomplets !',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            ProductService.postProduct(productCategoryId, productName, productCodebarMan).then(function (product) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Produit bien créé !',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors de la création du produit !',
                    template: 'Veuillez contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };

        $scope.updateUserEmail = function (email) {
            if (email == undefined || email == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Tous les champs n\'ont pas été rempli',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            UserService.patchUserEmail(email).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'email changé !',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                window.localStorage['email'] = email;
            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de l\'email!',
                    template: 'Le champ est vide',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            })
        };

        $scope.updateUserPassword = function (password1, password2) {
            if (password1 == "" || password1 == undefined || password2 == "" || password2 == undefined) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Tous les champs n\'ont pas été rempli',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (password1 != password2) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Les mots de passe de correspondent pas',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            if (password1.length <= 4) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe trop court!',
                    template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. ',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
                return;
            }
            UserService.patchUserPassword(password1).then(function (user) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mot de passe changé !',
                    template: '',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });

            }, function (error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erreur lors du changement de mot de passe!',
                    template: 'Veuillez contacter un admin',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-default-ios'
                        }
                    ]
                });
            });
        };
        var stopSockNewRfid = function(){
            $ionicLoading.hide();
            SocketService.socketOff();
            SocketService.socketListennerAuth();
        };

        var socketListennerNewRfid = function(){
            SocketService.socketOff();
            $rootScope.cancel = stopSockNewRfid;
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>En attente de la lecture d\'une carte vierge...<br><br><spanc lass=" button-inner" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="$root.cancel()"><i class="ion-close-circled"></i>Annuler</span>' });
            SocketService.socketOn().on('broadcastsocketio', function (newRFID) {
                console.log(newRFID);
                stopSockNewRfid();
                if(!newRFID.rfid_to_match){
                    var alertPopup = $ionicPopup.alert({
                        title: 'La carte n\'est pas vierge !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                    return;
                }
                $scope.show($ionicLoading);
                UserService.patchUserRfid(newRFID.card_id).then(function () {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Carte correctement ajoutée/modifiée !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                }, function (error) {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de la modification de la carte !',
                        template: error.data.code,
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                })
            })

        };

        $scope.updateRfid = function () {
            socketListennerNewRfid();
        };
        $scope.removeRfid = function () {
            var confirmPopup1 = $ionicPopup.confirm({
                title: 'Vous êtes sur le point de délier votre carte rfid de votre compte',
                template: '',
                buttons: [
                    { text: 'Annuler',
                        type: 'button-default-ios'
                    },
                    {

                        text: '<b>OK</b>',
                        type: 'button-default-ios'
                    }
                ]
            });
            confirmPopup1.then(function (res) {
                if(!res){
                    return;
                }
                UserService.patchNullUserRfid().then(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Carte correctement déliée de votre compte !',
                        template: '',
                        buttons: [
                            {
                                text: '<b>OK</b>',
                                type: 'button-default-ios'
                            }
                        ]
                    });
                })
            })
        }

    });

