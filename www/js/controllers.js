'use strict';

angular.module('livrogne-app.controllers',[])

.controller('AppCtrl', function($scope,$state, $ionicModal,$ionicHistory,$ionicPopup, $ionicPopover, $timeout, AuthService, UserService, AUTH_EVENTS, USER_ROLES) {
  $scope.isExpanded = false;
  $scope.hasHeaderFabLeft = false;
  $scope.hasHeaderFabRight = false;

  $scope.showPrivilege = function (privilege){
    if(window.localStorage['role']==USER_ROLES.user){
      if(privilege==USER_ROLES.admin) return false;
      else if(privilege==USER_ROLES.super_admin) return false;
    }
    if(window.localStorage['role']==USER_ROLES.admin){
      if(privilege==USER_ROLES.admin) return true;
      else if(privilege==USER_ROLES.super_admin) return false;
    }
    if(window.localStorage['role']==USER_ROLES.super_admin){
      if(privilege==USER_ROLES.admin) return true;
      else if(privilege==USER_ROLES.super_admin) return true;
    }
  };
  $scope.colourClass = function(number){
    if(number>=0) return "postiive";
    else return "negative";
  };
  var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();

    $state.go('app.login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session finie !',
      template: 'Désolé, vous devez vous connecter à nouveau.'
    });
  });

   $scope.logout = function(){
     AuthService.logout();
     $ionicHistory.clearCache().then(function(){
       setTimeout(function(){$state.go('app.login');},0);
     });

    };
    $scope.getPersonnalAccount = function(accounts){
      for(var i = 0; i<accounts.length;i++){
        if(accounts[i].type=="somebody") return accounts[i];
      }
    };
    $scope.valAbs = function(number){
      return Math.abs(number);
    };

    ////////////////////////////////////////
    // Layout Methods
    //////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
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

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})


.controller('LoginCtrl', function($scope,  $state, $timeout, $ionicPopup, AuthService, $ionicHistory, $http,USER_ROLES,ionicMaterialInk, UserService, UserAccountService, PromotionService, RfidService) {
  $scope.data = {};
  //$state.reload();
  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();
  $scope.$parent.clearFabs();
  $scope.$parent.hideHeader();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
  ionicMaterialInk.displayEffect();
  window.localStorage.clear();
  $scope.showSignIn=true;
  $scope.showSignUp=false;

  $scope.showSignUpF=function(){
    $scope.showSignIn=false;
    $scope.showSignUp=true;
  };
  $scope.showSignInF=function(){
    $scope.showSignIn=true;
    $scope.showSignUp=false;
  };


  $scope.signup = function(data){
    if(data.username1=="" || data.firstname1=="" || data.lastname1=="" || data.password1 == "" || data.password2 == ""||
      data.username1==undefined || data.firstname1==undefined || data.lastname1==undefined || data.password1 == undefined || data.password2 == undefined){
      var alertPopup = $ionicPopup.alert({
        title: 'Formulaire incomplet !',
        template: 'Tous les champs (à part l\'email) sont obligatoires.'
      });
      return;
    }
    if(data.password1 != data.password2){
      var alertPopup = $ionicPopup.alert({
        title: 'Erreur dans le choix du mot de passe !',
        template: 'La confirmation du mot de passe ne correspond pas !'
      });
      return;
    }
    if(data.password1.length<=4){
      var alertPopup = $ionicPopup.alert({
        title: 'Mot de passe trop court!',
        template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. '
      });
      return;
    }
    UserService.postUser(data, String(data.password2)).then(function(newUser){
      UserAccountService.postUserPersonnalAccount(newUser.id).then(function(userAccount){
        setTimeout(function(){
        var alertPopup = $ionicPopup.alert({
          title: 'Votre compte a été créé',
          template: 'Bienvenue à l\'ivrogne '+userAccount.user.firstname
        });}, 200);
        $scope.showSignInF();
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors de la création du compte !',
          template: 'Contacter un admin'
        });
      });
    });
  };

  $scope.rfidSearch =function() {
    RfidService.getLastRfid().then(function (authToken) {
      console.log(authToken);
      if(authToken.value == undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Aucune connexion par carte trouvée dans la base de donnée !',
          template: ''
        });
        return;
      };
      $http.defaults.headers.common['X-Auth-Token'] = authToken.value;
      while(window.localStorage["userId"] == null && window.localStorage["userId"]!=authToken.user.id)
        UserService.storeUserCredentials(authToken.value, authToken.user);
      PromotionService.storePromotions().then(function () {
        UserAccountService.storeLostAccountId().then(function () {
          UserAccountService.storeSpendingAccountId().then(function () {
            $ionicHistory.nextViewOptions({
              disableAnimate: false,
              disableBack: true
            });
            setTimeout(function(){$state.go('app.order');},0);
          }, function (err){
            console.log("Erreur lors du chargement du compte d'achat.")
          });
        }, function (err){
          console.log("Erreur lors du chargement du compte de perte.")
        });
      }, function (err){
        console.log("Erreur lors du chargement des promotions.")
      });
    },function (err) {
        var alertPopup = $ionicPopup.alert({

          title: 'Erreur de connexion!',
          template: 'Aucune connexion n\'a pu être établie avec le serveur.'
        });
        return;
    });
  };

  console.log($ionicHistory.viewHistory());
    $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      console.log(authenticated);
      if(authenticated.status ==-1){
        var alertPopup = $ionicPopup.alert({


          title: 'Erreur de connexion!',
          template: 'Aucune connexion n\'a pu être établie avec le serveur.'
        });
        return;
      }
      if(authenticated.status ==400){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur de connexion!',
          template: 'Mauvais identifiants !'
        });
        return;
      }
      PromotionService.storePromotions().then(function () {
        UserAccountService.storeLostAccountId().then(function () {
          UserAccountService.storeSpendingAccountId().then(function () {
            $ionicHistory.nextViewOptions({
              disableAnimate: false,
              disableBack: true
            });

            if(window.localStorage['userId']!=undefined){
              console.log("aaa");
              //$state.reload();

              $state.go('app.order');
            }

          }, function (err){
            console.log("Erreur lors du chargement du compte d'achat.")
          });
        }, function (err){
          console.log("Erreur lors du chargement du compte de perte.")
        });
      }, function (err){
        console.log("Erreur lors du chargement des promotions.")
      });
    });
  };

})

.controller('ActivityCtrl', function($scope, $state, $stateParams,$ionicPopup, $ionicHistory,$timeout, UserService,UserAccountService,OrderService,MoneyFlowService,
                        ionicMaterialMotion, ionicMaterialInk, AuthService, $q, USER_ROLES, $ionicLoading) {

  $scope.email=window.localStorage['email'];
  $scope.username=window.localStorage['username'];
  $scope.firstName= window.localStorage['firstName'];
  $scope.lastName= window.localStorage['lastName'];
  $scope.userId = window.localStorage['userId'];
  $scope.role= window.localStorage['role'];
   // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    var currentUserId =window.localStorage['userId'];
    var currentUserRole = window.localStorage['role'];
    $scope.currentUserRole = currentUserRole;
    var promise1 = UserAccountService.getUserPersonnalAccount();
    var promise2 = UserAccountService.getUserCashRegisterAccount();
    var promise3 = UserService.getUser(currentUserId);
    var promise4 = UserAccountService.getUserBankAccount()
    $scope.show = function() {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function(){
        $ionicLoading.hide();
    };


    var getDetails = function(){
        $scope.show($ionicLoading);
        $q.all([promise1, promise2, promise3, promise4]).then(function (data) {
            var userPersonnalAccount = data[0];
            var userCashRegisterAccount = data[1];
            var user = data[2];
            var userBankAccount = data[3];

            $scope.userPersonnalMoney= userPersonnalAccount.money_balance;
            if(userPersonnalAccount.money_balance>=0) $scope.classUserPeronnalMoney="positive";
            else $scope.classUserPeronnalMoney="negative";
            $scope.personnalOrders=userPersonnalAccount.orders;
            $scope.personnalPositiveMoneyFlows=userPersonnalAccount.positive_money_flows;
            $scope.personnalNegativeMoneyFlows=userPersonnalAccount.negative_money_flows;
            if(userPersonnalAccount.godfather !=undefined)
                $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname +" "+userPersonnalAccount.user.godfather.lastname;
            $scope.moneyLimit =  userPersonnalAccount.user.money_limit *(-1);
            if(currentUserRole==USER_ROLES.super_admin || currentUserRole==USER_ROLES.admin ) {
                    $scope.userCashRegisterMoney = userCashRegisterAccount.money_balance;
                    if (userCashRegisterAccount.money_balance >= 0) $scope.classUserCashRegisterMoney = "positive";
                    else $scope.classUserCashRegisterMoney = "negative";
                    $scope.cashRegisterOrders = userCashRegisterAccount.cash_register_orders;
                    $scope.cashRegisterPositiveMoneyFlows = userCashRegisterAccount.positive_money_flows;
                    $scope.cashRegisterMoneyNegativeFlows = userCashRegisterAccount.negative_money_flows;
                    $scope.nefews = user.nefews;
                    for (var i = 0; i < $scope.nefews.length; i++) {
                        $scope.nefews[i].money_limit = Math.abs($scope.nefews[i].money_limit);
                    }
            }
            if(currentUserRole==USER_ROLES.super_admin){
                    $scope.userBankMoney = userBankAccount.money_balance;
                    if (userBankAccount.money_balance >= 0) $scope.classUserBankMoney = "positive";
                    else $scope.classUserBankMoney = "negative";
                    $scope.bankPositiveMoneyFlows = userBankAccount.positive_money_flows;
                    $scope.bankNegativeFlows = userBankAccount.negative_money_flows;
            }
            $scope.hide($ionicLoading);

        },function(err){
            console.log("erreur lors de la récupération du solde de l'utilisiateur");
        })
    };
    getDetails();

/*
    var getDetails = function(){
      UserAccountService.getUserPersonnalAccount().then(function(userPersonnalAccount){
        $scope.userPersonnalMoney= userPersonnalAccount.money_balance;
        if(userPersonnalAccount.money_balance>=0) $scope.classUserPeronnalMoney="positive";
        else $scope.classUserPeronnalMoney="negative";
        $scope.personnalOrders=userPersonnalAccount.orders;
        $scope.personnalPositiveMoneyFlows=userPersonnalAccount.positive_money_flows;
        $scope.personnalNegativeMoneyFlows=userPersonnalAccount.negative_money_flows;
        if(userPersonnalAccount.godfather !=undefined)
          $scope.godfatherCredentials = userPersonnalAccount.user.godfather.firstname +" "+userPersonnalAccount.user.godfather.lastname;
        $scope.moneyLimit =  userPersonnalAccount.user.money_limit *(-1);
        if(currentUserRole==USER_ROLES.super_admin || currentUserRole==USER_ROLES.admin ) {
          UserAccountService.getUserCashRegisterAccount().then(function (userCashRegisterAccount) {
            $scope.userCashRegisterMoney = userCashRegisterAccount.money_balance;
            if (userCashRegisterAccount.money_balance >= 0) $scope.classUserCashRegisterMoney = "positive";
            else $scope.classUserCashRegisterMoney = "negative";
            $scope.cashRegisterOrders = userCashRegisterAccount.cash_register_orders;
            $scope.cashRegisterPositiveMoneyFlows = userCashRegisterAccount.positive_money_flows;
            $scope.cashRegisterMoneyNegativeFlows = userCashRegisterAccount.negative_money_flows;
          });
          UserService.getUser(currentUserId).then(function (user) {
            $scope.nefews = user.nefews;
            for (var i = 0; i < $scope.nefews.length; i++) {
              $scope.nefews[i].money_limit = Math.abs($scope.nefews[i].money_limit);
            }
          });
        }
        if(currentUserRole==USER_ROLES.super_admin){
          UserAccountService.getUserBankAccount().then(function(userBankAccount) {
            $scope.userBankMoney = userBankAccount.money_balance;
            if (userBankAccount.money_balance >= 0) $scope.classUserBankMoney = "positive";
            else $scope.classUserBankMoney = "negative";
            $scope.bankPositiveMoneyFlows = userBankAccount.positive_money_flows;
            $scope.bankNegativeFlows = userBankAccount.negative_money_flows;
          });
        }
      });
    };
    getDetails();
    */
    $scope.doRefresh = function() {
      getDetails();
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.onRelease = function(userId, value){
      value=value*(-1);
      UserService.patchUserMoneyLimit(userId,value).then(function(user){

      },function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de la limite de crédit!',
          template: 'Une erreur est survenue lors du changement de crédit. Veuillez prendre contact avec un administrateur.'
        });
      });
    };
  $scope.paymentType = function(isPaidCash){
    if(isPaidCash) return "via cash";
    else return "via compte";
  }

  $scope.showDeleteOrderConfirm = function(orderId) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Annuler une commande',
     template: 'Etes-vous sûr de vouloir supprimer la commande ?'
   });

   confirmPopup.then(function(res) {
     if(res) {
        OrderService.deleteOrder(orderId).then(function(result){
          var alertPopup = $ionicPopup.alert({
          title: 'Commande annulée avec succès!',
          template: 'Les comptes concernés ont été débités/crédités, vous trouverez l\'annulaton de commande dans les transferts d\'argents.'
          });


        }, function(error){
          var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors de l\'annulation la commande!',
          template: 'Une erreur est survenue lors de l\'annulation de la commande. Veuillez prendre contact avec un administrateur.'
          });
      });
     }
   });
  };

  $scope.showDeleteMoneyFlowConfirm = function(moneyFlowId) {

   var confirmPopup = $ionicPopup.confirm({
     title: 'Annuler un transfert',
     template: 'Etes-vous sûr de vouloir supprimer le transfert ?'
   });
   confirmPopup.then(function(res) {
     if(res) {
        MoneyFlowService.deleteMoneyFlow(moneyFlowId).then(function(result){
          var alertPopup = $ionicPopup.alert({
          title: 'Transfert annulé avec succès!',
          template: 'Les comptes concernés ont été débités/crédités. Vous trouverez une nouvelle entrée dans les comptes de transferts correspondants.'
          });


        }, function(error){
          var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors de l\'annulation du transfert!',
          template: 'Une erreur est survenue lors de l\'annulation du transfert. Veuillez prendre contact avec un administrateur.'
          });
      });
     }
   });
  };
   $scope.goTo = function(state){
     $state.go(state);
  };

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };


  $scope.toggleUnderGroup = function(group) {
    if ($scope.isUnderGroupShown(group)) {
      $scope.shownUnderGroup = null;
    } else {
      $scope.shownUnderGroup = group;
    }
  };
  $scope.isUnderGroupShown = function(group) {
    return $scope.shownUnderGroup === group;
  };
    // Set Ink
    ionicMaterialInk.displayEffect();
})
.controller('OrderCtrl', function($scope, $state, $stateParams,$ionicPopup, $ionicHistory,$timeout, PromotionService,USER_ROLES, UserService,
                                  ProductCategoryService,OrderService,MoneyFlowService,OrderLineService, ionicMaterialMotion, ionicMaterialInk, AuthService, UserAccountService, $q, $ionicLoading) {
   // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');
    $scope.orderLines=[];
    $scope.users={};
    $scope.adminPromotion=0.0;
    $scope.simplePromotion=0.0;
    var currentUserId=window.localStorage['userId'];
    var currentUserRole=window.localStorage['role'];
    var currentUserMoneyLimit =window.localStorage['moneyLimit'];
    var currentUserMoneyBalance = 0.0;
    var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
    var userCashRegisterAccountId= window.localStorage["userCashRegisterAccountId"];
    $scope.show = function() {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function(){
        $ionicLoading.hide();
    };
    var promise1 =PromotionService.getPromotions();
    var promise2 = UserService.getLimitedUsers();
    var promise3 = UserAccountService.getUserPersonnalAccount();
    var promise4 = ProductCategoryService.getProductCategories();


    var getInformation = function(){
        $scope.show($ionicLoading);
        $q.all([promise1, promise2, promise3, promise4]).then(function (data) {
            var promotions = data[0];
            var result = data[1];
            var currentUserPersonalAccount = data[2];
            var productCategories = data[3];

            for(var i=0; i<promotions.length; i++){
                if(promotions[i].promotion_name=="admin")$scope.adminPromotion=promotions[i].user_promotion;
                if(promotions[i].promotion_name=="simple")$scope.simplePromotion=promotions[i].user_promotion;
            }
            $scope.users= result;
            for(var i =$scope.users.length -1; i >=0  ; i--){
                if (currentUserId == $scope.users[i].id)
                    $scope.users.splice(i,1);
                else $scope.users[i].credential=$scope.users[i].firstname +" "+$scope.users[i].lastname;
            }
            currentUserMoneyBalance = currentUserPersonalAccount.money_balance;

            for (var i = 0; i < productCategories.length; i++) {
                for(var j=0 ; j< productCategories[i].products.length; j++){
                    if(productCategories[i].products[j].name=="Autre") productCategories[i].products.selectedProduct=productCategories[i].products[j];
                }
            }
            $scope.productCategories = productCategories;
            $scope.hide($ionicLoading);

        },function(err){
            console.log("erreur lors de la récupération du solde de l'utilisiateur");
        })
    };
    getInformation();
    /*var getInformation = function(){
      PromotionService.getPromotions().then(function(promotions) {

        for(var i=0; i<promotions.length; i++){
          if(promotions[i].promotion_name=="admin")$scope.adminPromotion=promotions[i].user_promotion;
          if(promotions[i].promotion_name=="simple")$scope.simplePromotion=promotions[i].user_promotion;
        }
        UserService.getLimitedUsers().then(function(result){
          $scope.users= result;
          for(var i =$scope.users.length -1; i >=0  ; i--){
            if (currentUserId == $scope.users[i].id)
              $scope.users.splice(i,1);
            else $scope.users[i].credential=$scope.users[i].firstname +" "+$scope.users[i].lastname;
          }
          UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount) {
            currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
            ProductCategoryService.getProductCategories().then(function(productCategories){
              $scope.productCategories=[];

              for (var i = 0; i < productCategories.length; i++) {
                for(var j=0 ; j< productCategories[i].products.length; j++){
                  if(productCategories[i].products[j].name=="Autre") productCategories[i].products.selectedProduct=productCategories[i].products[j];
                }
              }
              $scope.productCategories = productCategories;
            });
          },function(err){
            console.log("erreur lors de la récupération du solde de l'utilisiateur");
          });
        });
      });
    };
    getInformation();*/


    var computeOrderTotal = function(){
      $scope.orderTotal=0;
      for(var l=0; l < $scope.orderLines.length  ;l++){
        $scope.orderTotal += ($scope.orderLines[l].pc.price * $scope.orderLines[l].quantity);
      }
    };

    $scope.addNewOrderLine= function(pc, selectedProduct){
      console.log(selectedProduct);
      var newOrder=true;
      for(var k=0; k < $scope.orderLines.length;k++){
        if($scope.orderLines[k].pc.id == pc.id && $scope.orderLines[k].product.barcode==selectedProduct.barcode){
          $scope.orderLines[k].quantity++;
          newOrder=false;
        }
      }
      if(newOrder){
        var orderLine ={pc: pc, product: selectedProduct, quantity: 1};
        $scope.orderLines.push(orderLine);
      }
      computeOrderTotal();
    };

    $scope.removeOrderLine= function(pcId, productBarcode){
      for(var k=0; k < $scope.orderLines.length;k++){
        if($scope.orderLines[k].pc.id == pcId && $scope.orderLines[k].product.barcode==productBarcode){
          $scope.orderLines[k].quantity--;
          if( $scope.orderLines[k].quantity==0) $scope.orderLines.splice(k,1);
        }
      }
      computeOrderTotal();
    };


    $scope.persistOrder = function (type, client){
      var priceCoeff =1.0;
      if( type == "someoneElse" && client.role==USER_ROLES.user){
        priceCoeff = $scope.simplePromotion;
      }
      else if(type =="self" && currentUserRole == USER_ROLES.user) priceCoeff = $scope.simplePromotion;
      else priceCoeff = $scope.adminPromotion;
      var orderPrice = $scope.orderTotal*(100-priceCoeff)/100;

      if((type=="someoneElse" &&  client.role == USER_ROLES.user)||(type=="self"&& currentUserRole == USER_ROLES.user )){
        var moneyLimit= 0.0;
        var godfatherId = window.localStorage['godfatherId'];
        var simpleUserMoneyBalance = undefined;
        if(type=="someoneElse"){
          simpleUserMoneyBalance = $scope.getPersonnalAccount(client.user_accounts).money_balance;
          if(client.godfather !=undefined){
            moneyLimit = client.money_limit;
          }
        }
        else{
            moneyLimit = currentUserMoneyLimit;
            simpleUserMoneyBalance = currentUserMoneyBalance;
          }
        if((simpleUserMoneyBalance-orderPrice)<moneyLimit){
          var alertPopup = $ionicPopup.alert({
            title: 'Le client est fauché !',
            template: 'La limite imposée par le parrain est atteinte (par défaut 0 si le client est non-sponsorisé).'
          });
          return;
        }
      }

      var confirmPopup = $ionicPopup.confirm({
        title: 'Passer une commande',
        template: 'Etes-vous sûr de vouloir passer la commande pour un total de '+orderPrice +' € ?'
      });

      confirmPopup.then(function(res) {
            var ol=[];
            for(var k =0; k < $scope.orderLines.length; k++){
              var l={};
              l.product=$scope.orderLines[k].product.barcode;
              l.quantity=$scope.orderLines[k].quantity;
              ol[k]=l;
            }
            console.log($scope.orderLines);
            if(type =="self"){
              OrderService.addSelfOrder(userPersonnalAccountId,ol).then(function (result) {
                UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount) {
                  currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
                    var alertPopup = $ionicPopup.alert({
                      title: 'Commande réalisée avec succès !',
                      template: ''
                    });
                  },function(err){
                    console.log("erreur lors de la récupération du solde de l'utilisiateur");
                  });
              }, function (error) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Erreur lors de la création de la commande!',
                  template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                });
              });
            }
            else if(type =="someoneElse"){
              console.log(client.user_accounts[0].id);
              OrderService.addSEOrder(client.user_accounts[0].id,userCashRegisterAccountId, ol).then(function (result) {
                UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount) {
                  currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
                  var alertPopup = $ionicPopup.alert({
                    title: 'Commande réalisée avec succès !',
                    template: ''
                  });
                },function(err){
                  console.log("erreur lors de la récupération du solde de l'utilisiateur");
                });
              }, function (error) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Erreur lors de la création de la commande!',
                  template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                });
              });

            }
            else {
              OrderService.addCashOrder(userCashRegisterAccountId,ol).then(function (result) {
                UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount) {
                  currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
                  var alertPopup = $ionicPopup.alert({
                    title: 'Commande réalisée avec succès !',
                    template: ''
                  });
                },function(err){
                  console.log("erreur lors de la récupération du solde de l'utilisiateur");
                });
              }, function (error) {
                var alertPopup = $ionicPopup.alert({
                  title: 'Erreur lors de la création de la commande!',
                  template: 'Une erreur est survenue lors de la création de la commande. Veuillez contacter un admin.'
                });
              });

            }
            $scope.orderLines=[];
            getInformation();

      })
    };
  $scope.isSelected = function (productName){
      if(productName == "Autre") return "selected";
    };

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    /*
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });*/

    $scope.showButtonBar =function (pcId, produCategoriesLength){

      if((pcId)%4==0) {
        return "ng-show";
      }
      else return "ng-hide";

    };


    ionicMaterialInk.displayEffect();



})

.controller('MoneyFlowCtrl', function($scope, $state, $stateParams,$ionicPopup, $timeout, UserService,UserAccountService,OrderService, ProductCategoryService ,MoneyFlowService, AuthService,
                        ionicMaterialMotion, ionicMaterialInk, USER_ROLES) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');
    var currentUserId= window.localStorage['userId'];
    $scope.currentUserPersonnalAccountId=  window.localStorage['userPersonnalAccountId'];
    $scope.currentUserCashRegisterAccountId=  window.localStorage['userCashRegisterAccountId'];
    $scope.currentUserBankAccountId =  window.localStorage['userBankAccountId'];
    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);


    // Set Motion
    /*
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });*/
    // Set Ink
    ionicMaterialInk.displayEffect();

    $scope.users={};

    var getLimitedUsers = function(){
      UserService.getLimitedUsers().then(function(result) {
        $scope.users = result;
        for (var i = $scope.users.length -1; i >= 0 ; i--){
          if (currentUserId == $scope.users[i].id)
            $scope.users.splice(i,1);
          else $scope.users[i].credential = $scope.users[i].firstname + " " + $scope.users[i].lastname;
        }
      });
    };

    getLimitedUsers();

    $scope.lostAccountId = UserAccountService.getLostAccountId()

    $scope.spendingAccountId = UserAccountService.getSpendingAccountId()
    $scope.getUserPersonnalAccount = function(user){
      if(user==undefined ) return;
      for(var i = 0; i< user.user_accounts.length ; i++){
        if(user.user_accounts[i].type=="somebody") return user.user_accounts[i].id;
      }
    };
    $scope.getUserCashRegisterAccount = function(user){
      if(user==undefined ) return;
      for(var i = 0; i< user.user_accounts.length ; i++){
        if(user.user_accounts[i].type=="cash-register") return user.user_accounts[i].id;
      }
    };
    var currentUserMoneyBalance = undefined;
    var moneyLimit = undefined;
    UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount){
      currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
    });
    var isNefew = false;
    if( window.localStorage['godfatherId']!=undefined) {
      isNefew = true;
      moneyLimit=  window.localStorage['moneyLimit'];
    }


    $scope.persistMoneyFlow = function (debitAccountId, creditAccountId, value, description) {
      if(isNefew){
        if((currentUserMoneyBalance-value)<moneyLimit){
          var alertPopup = $ionicPopup.alert({
            title: 'Désolé mais vous êtes fauché !',
            template: 'Vous ne disposez pas d\'assez d\'argent ou de crédit sur votre compte pour effectuer le transfert'
          });
          return;
        }
      }

      if(value==undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Veuillez rentrer un montant',
          template: ''
        });
        return;
      }
      if(value<=0){
        var alertPopup = $ionicPopup.alert({
          title: 'Veuillez rentrer un montant supérieur à 0',
          template: ''
        });
        return;
      }
      if(creditAccountId==undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Veuillez rentrer un compter créditeur',
          template: ''
        });
        return;
      }
      if(debitAccountId==undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Veuillez rentrer un compter débiteur',
          template: ''
        });
        return;
      }
      var confirmPopup = $ionicPopup.confirm({
        title: 'Effectuer un transfert',
        template: 'Etes-vous sûr de vouloir faire le transfert pour un montant de '+value +' € ?'
      });
      confirmPopup.then(function(res) {
        if(res){
          MoneyFlowService.postMoneyFlow(debitAccountId, creditAccountId, value, description).then(
            function(result){
              var alertPopup = $ionicPopup.alert({
                title: 'Transfert bien effectué !',
                template:
                'Type compte débiteur : ' +result.debit_user_account.type+
                '; Type compte créditeur : '+result.credit_user_account.type+
                '; Montant : '+result.value+' €'
              });
              UserAccountService.getUserPersonnalAccount().then(function(currentUserPersonalAccount){
                currentUserMoneyBalance = currentUserPersonalAccount.money_balance;
              });

            }, function(error){
              var alertPopup = $ionicPopup.alert({
                title: 'Erreur lors du transfert !',
                template: 'Veuillez contacter un web-admin :'+error
              });
            });
        }
      })
    }
})

.controller('ScriptCtrl', function($scope, $state, $stateParams,$ionicPopup, $timeout, UserService,UserAccountService,OrderService, ScriptService,
                        ionicMaterialMotion, ionicMaterialInk) {
   // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    /*
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });*/

    // Set Ink
    ionicMaterialInk.displayEffect();

  $scope.openFridge = function (){
      ScriptService.openFridge().then(function(){
        var alertPopup = $ionicPopup.alert({
          title: 'Le frigo est ouvert !',
          template: ''
        });
      },function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lorsde l\'exécution du script!',
          template: 'Veuillez contacter un web-admin :'+error
        });
      });

    };

  $scope.openRegister= function (){
    ScriptService.openRegister().then(function(){
      var alertPopup = $ionicPopup.alert({
        title: 'La caise est ouverte !',
        template: ''
      });
    },function(err){
      var alertPopup = $ionicPopup.alert({
        title: 'Erreur lorsde l\'exécution du script!',
        template: 'Veuillez contacter un web-admin :'+error
      });
    });

  }

    $scope.turnBarOff = function () {
      ScriptService.turnBarOff().then(function(result){
        var alertPopup = $ionicPopup.alert({
          title: 'Félicitiation, vous avez éteint le bar !',
          template: 'Un grand pouvoir implique  de grandes responsabilités, ne jouez pas avec les nerfs de vos contemporains'
        });

      }, function(error){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lorsde l\'exécution du script!',
          template: 'Veuillez contacter un web-admin :'+error
        });
      })
    };

  $scope.turnBarOn = function () {
    ScriptService.turnBarOn().then(function(result){
      var alertPopup = $ionicPopup.alert({
        title: 'Félicitiation, vous avez allumer le bar !',
        template: 'Un grand pouvoir implique  de grandes responsabilités, ne jouez pas avec les nerfs de vos contemporains'
      });

    }, function(error){
      var alertPopup = $ionicPopup.alert({
        title: 'Erreur lorsde l\'exécution du script!',
        template: 'Veuillez contacter un web-admin :'+error
      });
    })
  };

})

.controller('StatisticCtrl', function($scope, $state, $stateParams,$ionicPopup, $timeout, UserService,UserAccountService,OrderService,
                        ionicMaterialMotion, ionicMaterialInk, USER_ROLES, AuthService, $q , $ionicLoading) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');
    var currentUserRole =  window.localStorage['role'];

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    /*
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });*/
  //testd

    // Set Ink
    ionicMaterialInk.displayEffect();

    $scope.totalPositiveBalance=0;
    $scope.totalNegativeBalance=0;
    $scope.allGodfathers =[];
    $scope.allUnsponsoredUsers=[];
    $scope.show = function() {
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function(){
        $ionicLoading.hide();
    };
    var promise1 =UserService.getUsers();



    var getInformation = function(){
        $scope.show($ionicLoading);
        $q.all([promise1]).then(function (data) {
           var users = data[0];
            for (var i = users.length - 1; i >= 0; i--) {
                if (users[i].role != USER_ROLES.user) {
                    users.splice(i, 1);
                }
                else if(users[i].godfather != undefined){
                    users.splice(i, 1);
                }
                else {
                    users[i].totalDebt = $scope.getPersonnalAccount(users[i].user_accounts).money_balance;
                    if(users[i].totalDebt>=0)$scope.totalPositiveBalance+=users[i].totalDebt;
                    else $scope.totalNegativeBalance+=users[i].totalDebt;
                    $scope.allUnsponsoredUsers=users;
                }
            }
            $scope.allGodfathers=users;
            for(var  i = $scope.allGodfathers.length -1; i>=0; i--){
                if($scope.allGodfathers[i].role==USER_ROLES.user){
                    $scope.allGodfathers.splice(i,1);
                }
                else{
                    var totalDebt=$scope.getPersonnalAccount($scope.allGodfathers[i].user_accounts).money_balance;
                    for(var j=0;j<$scope.allGodfathers[i].nefews.length;j++){
                        totalDebt+=$scope.allGodfathers[i].nefews[j].user_accounts[0].money_balance;
                    }
                    $scope.allGodfathers[i].totalDebt=totalDebt;
                    if(totalDebt>=0) $scope.totalPositiveBalance+=totalDebt;
                    else $scope.totalNegativeBalance+=totalDebt
                }
            }
            $scope.totalNegativeBalance = Math.abs($scope.totalNegativeBalance);
           $scope.hide($ionicLoading);

        },function(err){
            console.log("erreur lors de la récupération du solde de l'utilisiateur");
        })
    };
    if(currentUserRole != USER_ROLES.user)
        getInformation();
    /*
    var getAllUnsponsoredUsers = function(){
      UserService.getUsers().then(function(users) {
        for (var i = users.length - 1; i >= 0; i--) {
          if (users[i].role != USER_ROLES.user) {
            users.splice(i, 1);
          }
          else if(users[i].godfather != undefined){
              users.splice(i, 1);
            }
          else {
            users[i].totalDebt = $scope.getPersonnalAccount(users[i].user_accounts).money_balance;
            if(users[i].totalDebt>=0)$scope.totalPositiveBalance+=users[i].totalDebt;
            else $scope.totalNegativeBalance+=users[i].totalDebt;
            $scope.allUnsponsoredUsers=users;
          }
        }
      });
    };
    if(currentUserRole != USER_ROLES.user)
      getAllUnsponsoredUsers();
    var getGodFathers = function(){
      UserService.getUsers().then(function(users){
        $scope.allGodfathers=users;
        for(var  i = $scope.allGodfathers.length -1; i>=0; i--){
          if($scope.allGodfathers[i].role==USER_ROLES.user){
            $scope.allGodfathers.splice(i,1);
          }
          else{
            var totalDebt=$scope.getPersonnalAccount($scope.allGodfathers[i].user_accounts).money_balance;
            for(var j=0;j<$scope.allGodfathers[i].nefews.length;j++){
              totalDebt+=$scope.allGodfathers[i].nefews[j].user_accounts[0].money_balance;
            }
            $scope.allGodfathers[i].totalDebt=totalDebt;
            if(totalDebt>=0) $scope.totalPositiveBalance+=totalDebt;
            else $scope.totalNegativeBalance+=totalDebt
          }
        }
        $scope.totalNegativeBalance = Math.abs($scope.totalNegativeBalance);
      });
    };
    if(currentUserRole != USER_ROLES.user)
      getGodFathersw();
    */
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };

  $scope.toggleOtherGroup = function(group) {
    if ($scope.isOtherGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isOtherGroupShown = function(group) {
    return $scope.shownGroup === group;
  };


    $scope.toggleUnderGroup = function(group) {
      if ($scope.isUnderGroupShown(group)) {
        $scope.shownUnderGroup = null;
      } else {
        $scope.shownUnderGroup = group;
      }
    };
    $scope.isUnderGroupShown = function(group) {
      return $scope.shownUnderGroup === group;
    };

})


.controller('EditCtrl', function($scope, $state, $stateParams,$ionicPopup, $timeout, UserService,UserAccountService,OrderService,
                        ionicMaterialMotion, ionicMaterialInk, AuthService, USER_ROLES, ProductCategoryService, PromotionService, ProductService, RfidService) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');
    var currentUserId= window.localStorage['userId'];
    var currentUserRole =  window.localStorage['role'];
    $scope.email=window.localStorage['email'];
    $scope.username=window.localStorage['username'];
    $scope.firstName= window.localStorage['firstName'];
    $scope.lastName= window.localStorage['lastName'];
    $scope.userId = window.localStorage['userId'];
    $scope.role= window.localStorage['role'];

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    /*
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });*/

    // Set Ink
    ionicMaterialInk.displayEffect();


    PromotionService.getPromotions().then(function(promotions) {

      for(var i=0; i<promotions.length; i++){
        if(promotions[i].promotion_name=="admin")$scope.adminPromotion=promotions[i];
        if(promotions[i].promotion_name=="simple")$scope.simplePromotion=promotions[i];
      }
    });
  $scope.simpleSponsorisedUsers={};
    var getSimpleSponsorisedUsers = function(){
      UserService.getUsers().then(function(result) {
        $scope.simpleSponsorisedUsers = result;
        for (var i = $scope.simpleSponsorisedUsers.length -1; i >= 0; i--){
          if (currentUserId == $scope.simpleSponsorisedUsers[i].id)
            $scope.simpleSponsorisedUsers.splice(i,1);
          else if($scope.simpleSponsorisedUsers[i].godfather== undefined)
            $scope.simpleSponsorisedUsers.splice(i,1);
          else if($scope.simpleSponsorisedUsers[i].role==USER_ROLES.admin || $scope.simpleSponsorisedUsers[i].role==USER_ROLES.super_admin)
             $scope.simpleSponsorisedUsers.splice(i,1);
          else $scope.simpleSponsorisedUsers[i].credential = $scope.simpleSponsorisedUsers[i].firstname + " " + $scope.simpleSponsorisedUsers[i].lastname;
        }
      });
    };
  if(currentUserRole != USER_ROLES.user)
    getSimpleSponsorisedUsers();
    $scope.simpleUnsponsorisedUsers={};
    var getSimpleUnsponsorisedUsers = function(){
      UserService.getUsers().then(function(result) {
        $scope.simpleUnsponsorisedUsers = result;
        for (var i = $scope.simpleUnsponsorisedUsers.length -1; i >= 0; i--){
          if (currentUserId == $scope.simpleUnsponsorisedUsers[i].id)
            $scope.simpleUnsponsorisedUsers.splice(i,1);
          else if($scope.simpleUnsponsorisedUsers[i].godfather!= undefined)
            $scope.simpleUnsponsorisedUsers.splice(i,1);
          else if($scope.simpleUnsponsorisedUsers[i].role==USER_ROLES.admin || $scope.simpleUnsponsorisedUsers[i].role==USER_ROLES.super_admin)
            $scope.simpleUnsponsorisedUsers.splice(i,1);
          else $scope.simpleUnsponsorisedUsers[i].credential = $scope.simpleUnsponsorisedUsers[i].firstname + " " + $scope.simpleUnsponsorisedUsers[i].lastname;
        }
      });
    };
  if(currentUserRole != USER_ROLES.user)
    getSimpleUnsponsorisedUsers();

    $scope.admins={};

    var getAdmins = function(){
      UserService.getUsers().then(function(result) {
        $scope.admins = result;
        for (var i = $scope.admins.length - 1; i >= 0; i--){
          if($scope.admins[i].role==USER_ROLES.user)
             $scope.admins.splice(i,1);
          else $scope.admins[i].credential = $scope.admins[i].firstname + " " + $scope.admins[i].lastname;
        }
      });
    };
  if(currentUserRole != USER_ROLES.user)
    getAdmins();
    var getProductCategories = function(){
       ProductCategoryService.getProductCategories().then(function(productCategories){
        $scope.productCategories = productCategories;
      });
    };
    getProductCategories();

    $scope.updateUserDetails= function(firstname, lastname, username){
      if(firstname=="" || firstname == undefined || lastname ==undefined || lastname=="" || username==undefined || username==''){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement d\'info!',
          template: 'Tous les champs n\'ont pas été rempli'
        });
        return;
      }
      UserService.patchUserDetails(firstname,lastname, username).then(function(user){
        var alertPopup = $ionicPopup.alert({
          title: 'Infos changées !',
          template: ''
        });
        window.localStorage['firstName']=firstname;
        window.localStorage['lastName']=lastname;
        window.localStorage['username']=username;
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement d\'info!',
          template: 'Veuillez contacter un admin'
        });
      });

    };
    $scope.patchPromotion = function (simplePromotionName, adminPromotionName, simplePromotionRate, adminPromotionRate){
      if(simplePromotionName == undefined || adminPromotionName == undefined || simplePromotionRate == undefined || adminPromotionRate == undefined||
        simplePromotionRate<0 || adminPromotionRate <0 || simplePromotionRate >100 || adminPromotionRate >100){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de réduction!',
          template: 'Tous les champs n\'ont pas été rempli ou vous n\'avez pas entrer un nombre entre 0 et 100'
        });
        return;
      }
      PromotionService.patchPromotion(simplePromotionName, simplePromotionRate).then(function (promotion) {

      }, function(err){
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
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de réduction!',
          template: 'Veuillez contacter un admin'
        });
      })
    };
    $scope.patchUserRole = function(userToPromote){
      if(userToPromote == undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement d\'info!',
          template: 'Tous les champs n\'ont pas été rempli'
        });
        return;
      }
      var confirmPopup1 = $ionicPopup.confirm({
        title: 'Voulez vous vraiment promouvoir '+userToPromote.firstname+' ?',
        template: 'Cette opération est irréversible !'
      });
      confirmPopup1.then(function (res1) {
        if(res1){
          var confirmPopup2 = $ionicPopup.confirm({
            title: 'Voulez vous vraiment promouvoir '+userToPromote.firstname+' ?',
            template: 'Vous êtes-vraiment sûr ? !'
          });
          confirmPopup2.then(function (res2){
            if(res2){
              var confirmPopup3 = $ionicPopup.confirm({
                title: 'Voulez vous vraiment promouvoir '+userToPromote.firstname+' ?',
                template: 'On est d\'accord pas de regret ? !'
              });
              confirmPopup3.then(function(res3){
                if(res3){
                  UserService.patchUserRole(userToPromote.id).then(function(user) {
                    UserAccountService.postCashRegisterAccount(user.id).then(function (userAccount) {
                      var alertPopup = $ionicPopup.alert({
                        title: 'Utilisateur promu !',
                        template: ''
                      });
                    }, function (err) {
                      var alertPopup = $ionicPopup.alert({
                        title: 'Erreur lors de la promotion !',
                        template: 'Veuillez contacter un admin'
                      });

                    });
                  }, function (err) {
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
    $scope.patchNefewGodfather = function (nefewId, godfatherId, isNew){
      if(nefewId == undefined || godfatherId == undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement d\'info!',
          template: 'Tous les champs n\'ont pas été rempli'
        });
        return;
      }
      if(isNew){
        var confirmPopup1 = $ionicPopup.confirm({
          title: 'Voulez vous vraiment effectuer le parrainage?',
          template: "Une fois qu'un client est parrainé, il ne peut plus devenir admin !"
        });
        confirmPopup1.then(function (res1) {
          UserService.patchUserGodfather(nefewId,godfatherId).then(function(nefew){
            var alertPopup = $ionicPopup.alert({
              title: 'Parrain affecté !',
              template: ''
            });
          }, function(err){
            var alertPopup = $ionicPopup.alert({
              title: 'Erreur lors de l\'affection de parrain !',
              template: 'Veuillez contacter un admin'
            });
          });

        }, function(err){
          return;
        });
      }
      else{
        UserService.patchUserGodfather(nefewId,godfatherId).then(function(nefew){
          var alertPopup = $ionicPopup.alert({
            title: 'Parrain affecté !',
            template: ''
          });
        }, function(err){
          var alertPopup = $ionicPopup.alert({
            title: 'Erreur lors de l\'affection de parrain !',
            template: 'Veuillez contacter un admin'
          });
        });
      }


    };

    $scope.postProduct = function(productCategoryId, productName, productCodebarMan){
      console.log("test"+productCodebarMan);
      if(productCategoryId == undefined || productName =="" || productName==undefined || productCodebarMan==undefined  || productCodebarMan ==""){
        var alertPopup = $ionicPopup.alert({
          title: 'Champs incomplets !',
          template: ''
        });
        return;
      }
      ProductService.postProduct(productCategoryId, productName, productCodebarMan).then(function(product){
        var alertPopup = $ionicPopup.alert({
          title: 'Produit bien créé !',
          template: ''
        });
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors de la création du produit !',
          template: 'Veuillez contacter un admin'
        });
      })
    };

    $scope.updateUserEmail = function(email){
      if(email ==undefined || email == ""){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de mot de passe!',
          template: 'Tous les champs n\'ont pas été rempli'
        });
        return;
      }
      UserService.patchUserEmail(email).then(function(user){
        var alertPopup = $ionicPopup.alert({
          title: 'email changé !',
          template: ''
        });
        window.localStorage['email']=email;
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de l\'email!',
          template: 'Le champ est vide'
        });
      })
    };

    $scope.updateUserPassword = function(password1, password2){
      if(password1==""|| password1==undefined || password2 =="" || password2==undefined){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de mot de passe!',
          template: 'Tous les champs n\'ont pas été rempli'
        });
        return;
      }
      if(password1 != password2){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de mot de passe!',
          template: 'Les mots de passe de correspondent pas'
        });
        return;
      }
      if(password1.length<=4){
        var alertPopup = $ionicPopup.alert({
          title: 'Mot de passe trop court!',
          template: 'Faut quand même pas déconner, creuse toi un peu la tête mon garçon. '
        });
        return;
      }
      UserService.patchUserPassword(password1).then(function(user){
        var alertPopup = $ionicPopup.alert({
          title: 'Mot de passe changé !',
          template: ''
        });

      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Erreur lors du changement de mot de passe!',
          template: 'Veuillez contacter un admin'
        });
      });
    };

    $scope.updateRfid = function(){
      var confirmPopup1 = $ionicPopup.confirm({
        title: 'Veuillez passer la carte devant le lecteur rfid',
        template: ''
      });
      confirmPopup1.then(function () {
        RfidService.getLastRfidToMatch().then(function(rfidToMatch){
          if(rfidToMatch.value == undefined){
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
          }, function (err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Erreur lors de la modification de la carte !',
              template: err
            });
          })

        });
      });

    }
    $scope.removeRfid = function(){
      var confirmPopup1 = $ionicPopup.confirm({
        title: 'Vous êtes sur le point de délier votre carte rfid de votre compte',
        template: ''
      });
      confirmPopup1.then(function () {
        UserService.patchNullUserRfid().then(function () {
          var alertPopup = $ionicPopup.alert({
            title: 'Carte correctement déliée de votre compte !',
            template: ''
          });
        })
      })
    }

});

