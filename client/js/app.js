angular
  .module("app", [
    "lbServices",
    "ui.router",
    "ngNotify",
    "angular-loading-bar",
    // 'datatables', 
    // 'angulartics.google.analytics'
  ])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$httpProvider",
    function($stateProvider, $urlRouterProvider, $httpProvider) {
      $httpProvider.interceptors.push(function($q, $location, LoopBackAuth) {
        return {
          responseError: function(rejection) {
            if (rejection.status == 401) {
              LoopBackAuth.clearUser();
              LoopBackAuth.clearStorage();
              $location.nextAfterLogin = $location.path();
              $location.path("/login");
            }
            return $q.reject(rejection);
          }
        };
      });
      
      $stateProvider
        .state("login", {
          url: "/login",
          templateUrl: "views/login.html",
          controller: "LoginController"
        })
        
        // .state("register", {
        //   url: "/register",
        //   templateUrl: "views/register.html",
        //   controller: "RegisterController"
        // })

        /*
         * app State
         */
        .state("app", {
          url: "/app",
          templateUrl: "views/base.html",
          controller: "appController",
          abstract: true
        })
        .state("app.transactions", {
          url: "/transactions",
          templateUrl: "views/app/transactions.html",
          controller: "TransactionController"
        })
        .state("app.display", {
          url: "/display/:clientId",
          templateUrl: "views/app/display.html",
          controller: "DisplayController"
        })
        .state("app.entry", {
          url: "/entry",
          templateUrl: "views/app/entry.html",
          controller: "EntryController"
        })
        // Admin
        .state("app.dashboard", {
          url: "/dashboard",
          templateUrl: "views/app/dashboard.html",
          controller: "DashboardController"
        })
        .state("app.clients", {
          url: "/clients",
          templateUrl: "views/app/client.html",
          controller: "ClientController"
        })
        .state("app.announcement", {
          url: "/announcement",
          templateUrl: "views/entry/announcement.html",
          controller: "AnnouncementController"
        });

      $urlRouterProvider.otherwise("/login");
    }
  ]);