angular.module('livrogne-app')

 .service('AuthService', function($q, $http, USER_ROLES, API) {
  var userId = window.localStorage["userId"];
  var firstName= window.localStorage["firstName"];
  var lastName=window.localStorage["lastName"];
  var username=window.localStorage["username"];
  var email=window.localStorage["email"];
  var role= window.localStorage["role"];
  var isAuthenticated = window.localStorage["isAuthenticated"];
  var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
  var userBankAccountId= window.localStorage["userBankAccountId"];
  var userCashRegisterAccountId= window.localStorage["userCashRegisterAccountId"];
   var godfatherId= window.localStorage["godfatherId"];
   var moneyLimit= window.localStorage["moneyLimit"];
   function storeUserCredentials(token, user) {

     window.localStorage["userId"]= user.id;
     window.localStorage["firstName"] = user.firstname;
     window.localStorage["lastName"]= user.lastname;
     window.localStorage["username"]= user.username;
     window.localStorage["role"] =user.role;
     window.localStorage["email"]= user.email;
     window.localStorage["isAuthenticated"]= true;
     if(user.role==USER_ROLES.super_admin){
       for(var i =0; i < user.user_accounts.length ; i++){
         if(user.user_accounts[i].type=="somebody"){
           window.localStorage["userPersonnalAccountId"]=user.user_accounts[i].id;
         }
         else if(user.user_accounts[i].type=="cash-register"){
           window.localStorage["userCashRegisterAccountId"]=user.user_accounts[i].id;
         }
         else if(user.user_accounts[i].type=="bank"){
           window.localStorage["userBankAccountId"]=user.user_accounts[i].id;
         }
       }
     }
     if(user.role==USER_ROLES.admin){
       for(var i =0; i < user.user_accounts.length ; i++) {
         if (user.user_accounts[i].type == "somebody") {
           window.localStorage["userPersonnalAccountId"] = user.user_accounts[i].id;
         }
         else if (user.user_accounts[i].type == "cash-register") {
           window.localStorage["userCashRegisterAccountId"] = user.user_accounts[i].id;
         }
       }
     }
     if(user.role==USER_ROLES.user){
       for(var i =0; i < user.user_accounts.length ; i++) {
         if (user.user_accounts[i].type == "somebody") {
           window.localStorage["userPersonnalAccountId"] = user.user_accounts[i].id;
         }
       }
       window.localStorage["godfatherId"]=user.godfather;
       window.localStorage["moneyLimit"]=user.money_limit;

     }
     $http.defaults.headers.common['X-Auth-Token'] = token;

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

      authToken = response.data;
      $http.defaults.headers.common['X-Auth-Token'] = authToken.value;
      while(window.localStorage["userId"] == null && window.localStorage["userId"]!=authToken.user.id)
        storeUserCredentials(authToken.value, authToken.user);

      deferred.resolve( authToken);
    },function (err) {
      deferred.resolve(err);
    });
    promise.success = function(fn) {
      promise.then(fn);
      return promise;
    }
    promise.error = function(fn) {
      promise.then(null, fn);
      return promise;
    }
    return promise;

  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated!=undefined && authorizedRoles.indexOf(role) !== -1);;
  };


  return {
    login: login,
    logout: logout,
    storeUserCredentials: function(token, user) {return user},
    isAuthorized: isAuthorized,
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


.factory('UserService', function($http, USER_ROLES, API, PromotionService, AuthService) {
  var users = [];


  return {
    getUsers: function(){
      return $http.get(API.url+"/admin/users").then(function(response){
        users = response.data;
        return users;
      });
    },
    getLimitedUsers: function(){
      return $http.get(API.url+"/limited-users").then(function(response){
        users = response.data;
        return users;
      });
    },
    storeUserCredentials: function (token, user) {

      window.localStorage["userId"]= user.id;
      window.localStorage["firstName"] = user.firstname;
      window.localStorage["lastName"]= user.lastname;
      window.localStorage["username"]= user.username;
      window.localStorage["role"] =user.role;
      window.localStorage["email"]= user.email;
      window.localStorage["isAuthenticated"]= true;
      if(user.role==USER_ROLES.super_admin){
          for(var i =0; i < user.user_accounts.length ; i++) {
              if (user.user_accounts[i].type == "somebody") {
                  window.localStorage["userPersonnalAccountId"] = user.user_accounts[i].id;
              }
              else if (user.user_accounts[i].type == "cash-register") {
                  window.localStorage["userCashRegisterAccountId"] = user.user_accounts[i].id;
              }
              else if (user.user_accounts[i].type == "bank") {
                  window.localStorage["userBankAccountId"] = user.user_accounts[i].id;
              }
          }
      }
      if(user.role==USER_ROLES.admin){
          for(var i =0; i < user.user_accounts.length ; i++) {
              if (user.user_accounts[i].type == "somebody") {
                  window.localStorage["userPersonnalAccountId"] = user.user_accounts[i].id;
              }
              else if (user.user_accounts[i].type == "cash-register") {
                  window.localStorage["userCashRegisterAccountId"] = user.user_accounts[i].id;
              }

          }
      }
      if(user.role==USER_ROLES.user){
          for(var i =0; i < user.user_accounts.length ; i++) {
              if (user.user_accounts[i].type == "somebody") {
                  window.localStorage["userPersonnalAccountId"] = user.user_accounts[i].id;
              }
          }
        window.localStorage["godfatherId"]=user.godfather;
        window.localStorage["moneyLimit"]=user.money_limit;
      }
      $http.defaults.headers.common['X-Auth-Token'] = token;

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
        user = response.data;
        return user;
      });
    },
    patchUserRole: function(userToPromoteId){
      var adminPromotionId = window.localStorage["adminPromotionId"];
      var simplePromotionId = window.localStorage["simplePromotionId"];

      var data=
      {
        role: "ROLE_ADMIN",
        promotion: adminPromotionId
      };
      return $http.patch(API.url+"/admin/users/"+userToPromoteId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        user = response.data;
        return user;
      });
    },
    patchUserRfid: function(rfidNumber){
      var userId=window.localStorage["userId"];
      var data=
      {
        rfidCard: rfidNumber
      };
      console.log(data);
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
    patchUserGodfather: function(nefewId, godfatherId){
      var data=
      {
        godfather: godfatherId
      };
      return $http.patch(API.url+"/admin/users/"+nefewId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        user = response.data;
        return user;
      });
    },
    patchUserMoneyLimit: function(nefewId, moneyLimit){
      var data=
      {
        moneyLimit: moneyLimit
      };
      return $http.patch(API.url+"/admin/users/"+nefewId, data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
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
          user = response.data;
          return user;
      });
    }
  }
})

.factory('UserAccountService', function($http, USER_ROLES, API) {

  var putInDescendindOrder = function(ordersOrMoneyFlows){
    newOrdersOrMoneyFlows=[];
    for (i = 0; i < ordersOrMoneyFlows.length; i++) {
      newOrdersOrMoneyFlows[i]=ordersOrMoneyFlows[ordersOrMoneyFlows.length-1-i];
      var d = new Date(Date.parse(newOrdersOrMoneyFlows[i].created_at));
      newOrdersOrMoneyFlows[i].created_at=d;
    }
    return newOrdersOrMoneyFlows;
  };
  return {
    postUserPersonnalAccount: function(userID){
      var data=
      {
        user: userID,
        type:"somebody"
      };
      return $http.post(API.url+"/user-accounts", data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        userAccount = response.data;
        return userAccount;
      });
    },
    postCashRegisterAccount: function(userID){
      var data=
      {
        user: userID,
        type:"cash-register"
      };
      return $http.post(API.url+"/user-accounts", data,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        userAccount = response.data;
        return userAccount;
      });
    },
    getUserPersonnalAccount: function(){
      var userPersonnalAccountId= window.localStorage["userPersonnalAccountId"];
        return $http.get(API.url+"/user-accounts/"+userPersonnalAccountId).then(function(response){
          response.data.cash_register_orders = putInDescendindOrder(response.data.cash_register_orders);
          response.data.orders = putInDescendindOrder(response.data.orders);
          response.data.positive_money_flows = putInDescendindOrder(response.data.positive_money_flows);
          response.data.negative_money_flows = putInDescendindOrder(response.data.negative_money_flows);
          userAccount = response.data;
          return userAccount;
      });
    },
    storeLostAccountId: function(){
      return $http.get(API.url+"/lost-account").then(function(response){
        lostAccount = response.data;
        window.localStorage["lostAccountId"]= lostAccount[0].id;
        return lostAccount;
      });
    },
    storeSpendingAccountId: function(){
      return $http.get(API.url+"/spending-account").then(function(response){
        spendingAccount = response.data;
        window.localStorage["spendingAccountId"]= spendingAccount[0].id;
        return spendingAccount;
      });
    },
    getUserCashRegisterAccount: function(){
      var userCashRegisterAccountId= window.localStorage["userCashRegisterAccountId"];

        return $http.get(API.url+"/user-accounts/"+userCashRegisterAccountId).then(function(response){
          response.data.cash_register_orders = putInDescendindOrder(response.data.cash_register_orders);
          response.data.orders = putInDescendindOrder(response.data.orders);
          response.data.positive_money_flows = putInDescendindOrder(response.data.positive_money_flows);
          response.data.negative_money_flows = putInDescendindOrder(response.data.negative_money_flows);
          userAccount = response.data;
          return userAccount;
      });
    },
    getUserBankAccount: function(){
      var userBankAccountId= window.localStorage["userBankAccountId"];
        return $http.get(API.url+"/user-accounts/"+userBankAccountId).then(function(response){
          response.data.bankOrders = putInDescendindOrder(response.data.orders);
          response.data.positive_money_flows = putInDescendindOrder(response.data.positive_money_flows);
          response.data.negative_money_flows = putInDescendindOrder(response.data.negative_money_flows);

          userAccount = response.data;
          return userAccount;
      });
    }
  }
})

.factory('OrderService', function($http,  API) {

  return {
    deleteOrder: function(orderId){
        return $http.delete(API.url+"/admin/orders/"+orderId,{headers: {'Content-Type': 'application/json'}}).then(function(response){
          cancelMoneyFlow = response.data;
          return cancelMoneyFlow;
      });
    },
    addCashOrder: function(cashRegisterAccount, orderlines){
      var data = {};
      data.order={};
      data.orderlines = orderlines;
      data.order.cashRegisterAccount =cashRegisterAccount;
      console.log("ici");
      console.log(data);
      return $http.post(API.url+"/admin/orders/cash", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        order = response.data;
        console.log(order);
        return order;
      });
    },
    addSEOrder: function(customerUserAccount,cashRegisterAccount, orderlines){

      var data = {};
      data.order={};
      data.orderlines = orderlines;
      data.order.customerUserAccount =customerUserAccount;
      data.order.cashRegisterAccount =cashRegisterAccount;
      return $http.post(API.url+"/admin/orders/order-someone-else", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        order = response.data;
        return order;
      });
    },
    addSelfOrder: function(customerUserAccount, orderlines){

      var data = {};
      data.order={};
      data.order.customerUserAccount=customerUserAccount;
      data.orderlines = orderlines;
      console.log(data);
      return $http.post(API.url+"/client-self-order", data ,{headers: {'Content-Type': 'application/json'}}).then(function(response){
        order = response.data;
        console.log(response.data);
        return order;
      });
    }

  }
})

.factory('OrderLineService', function($http,  API) {
  return {
    addOrderLine: function(orderId,productId, quantity){
      var data = {
        product: productId,
        order: orderId,
        quantity: quantity
      };
      return $http.post(API.url+"/order-lines", data  ,{headers: {'Content-Type': 'application/json'}})
        .then(function(response){
          orderLine = response.data;
          return orderLine;
      });
    }
  }
})

.factory('MoneyFlowService', function($http,  API) {
  return {
    deleteMoneyFlow: function(moneyFlowId){
        return $http.delete(API.url+"/admin/money-flows/"+moneyFlowId,{headers: {'Content-Type': 'application/json'}}).then(function(response){
          cancelMoneyFlow = response.data;
          return cancelMoneyFlow;
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
          moneyFlow = response.data;
          return moneyFlow;
        });
    }
  }
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
          product = response.data;
          return product;
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
          promotion = response.data;
          return promotion;
        })
      },
      storePromotions: function(){
        return $http.get(API.url+"/promotions",{headers: {'Content-Type': 'application/json'}}).then(function(response){
          promotions = response.data;
          for(var i =0; i < promotions.length ; i++){
            if(promotions[i].promotion_name =="simple") window.localStorage["simplePromotionId"] = promotions[i].id;
            if(promotions[i].promotion_name =="admin") window.localStorage["adminPromotionId"] = promotions[i].id;
          }
          return promotions;
        });
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
          backCode = response.data;
          return backCode;
        });
    },
    turnBarOn: function () {

      return $http.get(API.url + "/admin/scripts/ALLrelaispriseON.py")
        .then(function (response) {
          backCode = response.data;
          return backCode;
        });
    },
    turnFridgeOn: function () {

      return $http.get(API.url + "/admin/scripts/relaisFrigoON.py")
        .then(function (response) {
          backCode = response.data;
          return backCode;
        });
    },
    turnFridgeOff: function () {

        return $http.get(API.url + "/admin/scripts/relaisFrigoOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    openRegister: function () {

      return $http.get(API.url + "/admin/scripts/relaisCaisseON.py")
        .then(function (response) {
          backCode = response.data;
          return backCode;
        });
    },
    closeRegister: function () {

        return $http.get(API.url + "/admin/scripts/relaisCaisseOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnMusicOn: function () {

        return $http.get(API.url + "/admin/scripts/relaisMusicON.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnMusicOff: function () {

        return $http.get(API.url + "/admin/scripts/relaisMusicOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnLightOff: function () {

        return $http.get(API.url + "/admin/scripts/relaisLightOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnLightOn: function () {

        return $http.get(API.url + "/admin/scripts/relaisLightON.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnEcranOn: function () {

        return $http.get(API.url + "/admin/scripts/relaisEcranON.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnEcranOff: function () {

        return $http.get(API.url + "/admin/scripts/relaisEcranOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnCocktailOn: function () {

        return $http.get(API.url + "/admin/scripts/relaisCocktailON.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
    turnCocktailOff: function () {

        return $http.get(API.url + "/admin/scripts/réelaisCocktailOFF.py")
            .then(function (response) {
                backCode = response.data;
                return backCode;
            });
    },
  }
})
.factory('RfidService', function($http,  API) {
  return {
    getLastRfid: function () {

      return $http.get(API.url + "/rfid-auth-tokens")
        .then(function (response) {
          authToken = response.data;
          return authToken;
        });
    },
    getLastRfidToMatch: function () {

      return $http.get(API.url + "/rfid-to-match")
        .then(function (response) {
          rfid = response.data;
          return rfid;
        });
    }
  }
});

//
