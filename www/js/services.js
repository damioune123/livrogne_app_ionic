

angular.module('livrogne-app')

    .service('AuthService', function($q, $http, USER_ROLES, API,UserService) {

        function storeUserCredentials(user) {
            window.localStorage.userId= user.id;
            window.localStorage.firstName = user.firstname;
            window.localStorage.lastName= user.lastname;
            window.localStorage.username= user.username;
            window.localStorage.role =user.role;
            window.localStorage.email= user.email;
            window.localStorage.isAuthenticated= true;
            var i;
            if(user.role!==USER_ROLES.barman){
                for(i =0; i < user.user_accounts.length ; i++){
                    if(user.user_accounts[i].type==="somebody"){
                        window.localStorage.userPersonnalAccountId=user.user_accounts[i].id;
                    }
                }
            }
            else{
                for(i =0; i < user.user_accounts.length ; i++){
                    if(user.user_accounts[i].type==="bank"){
                        window.localStorage.bankAccountId=user.user_accounts[i].id;
                    }
                    else if(user.user_accounts[i].type==="register"){
                        window.localStorage.registerAccountId=user.user_accounts[i].id;
                    }
                }
            }
        }
        function destroyUserCredentials() {
            $http.defaults.headers.common['X-Auth-Token'] = undefined;
            window.localStorage.clear();
        }

        var login = function(username, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            var data= {
                login: username,
                password: pw
            };
            $http.post(API.url+"/auth-tokens", data).then(function(response) {
                $http.defaults.headers.common['X-Auth-Token'] = response.data.value;
                window.localStorage.userId=response.data.user.id;
                UserService.getUser().then(function (response) {
                    storeUserCredentials(response);
                    deferred.resolve(response);
                },function (error) {
                    deferred.resolve(error);
                });

            },function (error) {
                deferred.resolve(error);
            });
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            };
            return promise;

        };

        var logout = function() {
            destroyUserCredentials();
        };


        return {
            login: login,
            logout: logout,
            storeUserCredentials: storeUserCredentials,
            isAuthenticated: function() {return window.localStorage["isAuthenticated"];}
        };
    })

    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })


    .factory('UserService', function($http, USER_ROLES, API) {
        var users = [];


        return {
            getUsers: function(page){
                return $http({url: API.url+"/admin/users?page="+page+"&sort=desc", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            getLimitedUsers: function(){
                return $http({url: API.url+"/limited-users", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            postUser: function(details, pw){
                var data=
                    {
                        firstname: details.firstname1,
                        lastname:details.lastname1,
                        username:details.username1,
                        email:details.email1,
                        plainPassword:pw
                    };
                return $http.post(API.url+"/users", data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            patchUserRfid: function(rfidNumber){
                var userId=window.localStorage["userId"];
                var data=
                    {
                        rfidCard: rfidNumber
                    };
                return $http.patch(API.url+"/users/"+userId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            patchNullUserRfid: function(){
                var userId=window.localStorage["userId"];
                var data=
                    {
                        rfidCard: null
                    };
                return $http.patch(API.url+"/users/"+userId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            patchUserGodfather: function(nefewId){

                return $http.patch(API.url+"/admin/users/set-nefew/"+nefewId,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            patchUserMoneyLimit: function(nefewId, moneyLimit){
                return $http.patch(API.url+"/admin/users-acccounts/money-limit/"+nefewId+"?money_limit="+moneyLimit,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            patchUserDetails: function(firstname, lastname, username){
                var userId=window.localStorage["userId"];
                var data=
                    {
                        firstname:firstname,
                        lastname:lastname,
                        username:username
                    };
                return $http.patch(API.url+"/users/"+userId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            patchUserEmail: function(email){
                var userId=window.localStorage["userId"];
                var data=
                    {
                        email:email
                    };
                return $http.patch(API.url+"/users/"+userId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            patchUserPassword: function(pw){
                var userId=window.localStorage["userId"];
                var data=
                    {
                        plainPassword:pw
                    };
                return $http.patch(API.url+"/users/"+userId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    user = response.data;
                    return user;
                });
            },
            getUser: function(){
                var userId=window.localStorage["userId"];
                return $http.get(API.url+"/users/"+userId,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            }
        }
    })
    .factory('SocketService', function (socketFactory, $ionicPopup,AuthService,RfidService,$ionicHistory,$state,$q) {
        var mySocket;
        var socketOn = function(){
            var myIoSocket = io.connect('http://192.168.0.210:5000');

            mySocket = socketFactory({
                ioSocket: myIoSocket
            });
            return mySocket;
        };
        var socketOff = function(){
            mySocket.removeAllListeners();

        };
        var socketListennerAuth = function(){
            socketOn().on('broadcastsocketio', function (authtokenAndId) {
                socketOff();
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Une carte a été detectée au nom de '+authtokenAndId.firstname+" "+authtokenAndId.lastname,
                    template: 'Desirez vous vous connecter sur ce compte ?'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        AuthService.logout();
                        var promise1 = RfidService.login(authtokenAndId.token, authtokenAndId.userId);
                        $q.all([promise1]).then(function (data) {
                            $ionicHistory.nextViewOptions({
                                disableAnimate: false,
                                disableBack: true
                            });
                            socketListennerAuth();
                            setTimeout(function () {
                                $state.go('app.dashBoard');
                            }, 0);

                        }, function (error) {
                            socketListennerAuth();
                            var alertPopup = $ionicPopup.alert({
                                title: 'Erreur lors de la connexion',
                                template: ''
                            });
                        });
                    }
                    else{
                        socketListennerAuth();
                    }
                })
            });
        };

        return{
            socketOn:socketOn,
            socketOff:socketOff,
            socketListennerAuth: socketListennerAuth

        }
    })


    .factory('UserAccountService', function($http, USER_ROLES, API) {
        return {

            getUserPersonnalAccount: function(){
                var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
                return $http.get(API.url+"/user-accounts/"+userPersonnalAccountId).then(function(response){
                    return response.data;
                });
            },
            getUserPersonnalAccountOrders: function(page){
                var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
                return $http({url: API.url+"/user-accounts/"+userPersonnalAccountId+"?page="+page+"&operations=order&sort=desc", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            getUserPersonnalAccountRegisterOrders: function(page){
                var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
                return $http({url: API.url+"/user-accounts/"+userPersonnalAccountId+"?page="+page+"&operations=registerOrder&sort=desc", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            getUserPersonnalAccountPositiveMoneyFlows: function(page){
                var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
                return $http({url: API.url+"/user-accounts/"+userPersonnalAccountId+"?page="+page+"&operations=positive_money_flows&sort=desc", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            getUserPersonnalAccountNegativeMoneyFlows: function(page){
                var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
                return $http({url: API.url+"/user-accounts/"+userPersonnalAccountId+"?page="+page+"&operations=negative_money_flows&sort=desc", method: "GET"}).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            },
            storeLostAccountId: function(){
                return $http.get(API.url+"/admin/lost-account").then(function(response){
                    window.localStorage["lostAccountId"]= response.data.id;
                    return response.data;
                });
            },
            storeSpendingAccountId: function(){
                return $http.get(API.url+"/admin/spending-account").then(function(response){
                    window.localStorage["spendingAccountId"]= response.data.id;
                    return response.data;
                });
            },
            promoteAdmin :function(userId){
                return $http.patch(API.url+"/super-admin/users/promote-admin/"+userId).then(function(response){
                    console.log(response.data);
                    return response.data;
                });
            }

        }
    })

    .factory('OrderService', function($http,  API) {

        return {
            deleteOrder: function(orderId, admin){
                return $http.delete(API.url+"/admin/orders/"+orderId+"?adminAuthentifier="+admin,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            addCashOrder: function( orderlines){
                var data = {};
                data.orderlines = orderlines;
                console.log(data);
                return $http.post(API.url+"/admin/orders/cash", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            addSEOrder: function(customerUserAccount,orderlines){

                var data = {};
                data.order={};
                data.order.customerUserAccount =customerUserAccount;
                data.orderlines = orderlines;
                return $http.post(API.url+"/admin/orders/order-someone-else", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            addSelfOrder: function( orderlines){

                var data = {};
                data.orderlines = orderlines;
                console.log(data);
                return $http.post(API.url+"/orders/client-self-order", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            orderCheckPrices: function( orderlines){

                var data = {};
                data.orderlines = orderlines;
                console.log(data);
                return $http.post(API.url+"/orders/check-prices", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            orderLineCheckPrices: function( orderline){
                var data = orderline;
                console.log(data);
                return $http.post(API.url+"/order-lines/check-prices", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            getOrder: function( orderId){
                return $http.get(API.url+"/orders/"+orderId).then(function(response){
                    return response.data;
                });
            }

        }
    })

    .factory('MoneyFlowService', function($http,  API) {
        return {
            deleteMoneyFlow: function(moneyFlowId){
                return $http.delete(API.url+"/admin/money-flows/"+moneyFlowId,{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    return response.data;
                });
            },
            postMoneyFlow : function(debitAccountId, creditAccountId, value, description){
                var data=
                    {
                        "creditUserAccount":creditAccountId,
                        "debitUserAccount": debitAccountId,
                        "value": value,
                        "description": description
                    };
                return $http.post(API.url+"/money-flows", data  ,{headers: {'Content-Type': 'application/json'}})
                    .then(function(response){
                        return response.data;
                    });
            },
            getDebitMoneyFlow: function( moneyFlowId){
                return $http.get(API.url+"/money-flows/"+moneyFlowId+"?type=debit").then(function(response){
                    return response.data;
                });
            },
            getCreditMoneyFlow: function( moneyFlowId){
            return $http.get(API.url+"/money-flows/"+moneyFlowId+"?type=credit").then(function(response){
                    return response.data;
                });
            }
        };
    })

    .factory('ProductCategoryService', function($http,  API) {
        var productCategories = [];
        var getProductCategories= function(){
            return $http.get(API.url+"/product-categories",{headers: {'Content-Type': 'application/json'}}).then(function(response){
                productCategories = response.data;
                return productCategories;
            });
        };
        return {getProductCategories: getProductCategories};
    })

    .factory('ProductService', function($http,  API) {
        return {
            postProduct: function (productCategoryId, productName, productBarcodeMan) {
                var data = {
                    productCategory: productCategoryId,
                    name: productName,
                    barcode: productBarcodeMan
                };
                return $http.post(API.url+"/admin/products",data, {headers: {'Content-Type': 'application/json'}}).then(function (response) {
                    return response.data;
                });
            }
        }
    })
    .factory('PromotionService', function($http,  API) {
        var promotions = [];
        return {
            patchPromotion: function (promotionName, promotionRate) {
                var data = {
                    userPromotion: promotionRate
                };
                return $http.patch(API.url + "/super-admin/promotions/"+promotionName, data, {headers: {'Content-Type': 'application/json'}}).then(function (response) {
                    return response.data;
                })
            },
            getPromotions: function(){
                return $http.get(API.url+"/promotions",{headers: {'Content-Type': 'application/json'}}).then(function(response){
                    promotions = response.data;
                    return promotions;
                });
            }
        };
    })

    .factory('ScriptService', function($http,  API) {
        return {
            turnBarOff: function () {

                return $http.get(API.url + "/admin/scripts/ALLrelaispriseOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnBarOn: function () {

                return $http.get(API.url + "/admin/scripts/ALLrelaispriseON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnFridgeOn: function () {

                return $http.get(API.url + "/admin/scripts/relaisFrigoON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnFridgeOff: function () {

                return $http.get(API.url + "/admin/scripts/relaisFrigoOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            openRegister: function () {

                return $http.get(API.url + "/admin/scripts/relaisCaisseON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            closeRegister: function () {

                return $http.get(API.url + "/admin/scripts/relaisCaisseOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnMusicOn: function () {

                return $http.get(API.url + "/admin/scripts/relaisMusicON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnMusicOff: function () {

                return $http.get(API.url + "/admin/scripts/relaisMusicOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnLightOff: function () {

                return $http.get(API.url + "/admin/scripts/relaisLightOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnLightOn: function () {

                return $http.get(API.url + "/admin/scripts/relaisLightON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnEcranOn: function () {

                return $http.get(API.url + "/admin/scripts/relaisEcranON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnEcranOff: function () {

                return $http.get(API.url + "/admin/scripts/relaisEcranOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnCocktailOn: function () {

                return $http.get(API.url + "/admin/scripts/relaisCocktailON.py")
                    .then(function (response) {
                        return response.data;
                    });
            },
            turnCocktailOff: function () {

                return $http.get(API.url + "/admin/scripts/relaisCocktailOFF.py")
                    .then(function (response) {
                        return response.data;
                    });
            }
        }
    })
    .factory('RfidService', function($http,  API, $q,UserService, AuthService) {
        var login = function(token_value, user_id) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http.defaults.headers.common['X-Auth-Token'] = token_value;
            window.localStorage.userId=user_id;
            UserService.getUser().then(function (response) {
                AuthService.storeUserCredentials(response);
                deferred.resolve(response);
            },function (error) {
                deferred.resolve(error);
            });
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            };
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            };
            return promise;

        };
        return {
            login :login,
            getLastRfid: function () {

                return $http.get(API.url + "/rfid-auth-tokens")
                    .then(function (response) {
                        return response.data;
                    });
            },
            getLastRfidToMatch: function () {

                return $http.get(API.url + "/rfid-to-match")
                    .then(function (response) {
                        return response.data;
                    });
            }
        }
    });

//
