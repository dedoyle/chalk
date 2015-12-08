// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'starter.directives', 'starter.filters', 'morphCarousel', 'once'])

.run(function ($ionicPlatform, ExpenseService, BudgetService) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

    ExpenseService.initDB();
    BudgetService.initDB();
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.expense', {
    url: '/expense',
    views: {
      'menuContent': {
        templateUrl: 'templates/expense.html',
        controller: 'ExpenseController as expense',
      }
    }
  })

  .state('app.detail', {
    url: '/detail/:expenseId/:rev/:day',
    views: {
      'menuContent': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailController as detail',
        resolve: {
          expense: expense
        }
      }
    }
  })

  .state('app.add-or-edit', {
    url: '/add-or-edit/:action/:isAdd/:expenseId/:day',
    views: {
      'menuContent': {
        templateUrl: 'templates/add-or-edit.html',
        controller: 'EditController as edit',
        resolve: {
          action: action,
          expense: expense
        }
      }
    }
  })

  .state('app.description', {
    url: '/description/:action/:isAdd/:expenseId',
    views: {
      'menuContent': {
        templateUrl: 'templates/description.html',
        controller: 'DescriptionController as desc',
        resolve: {
          action: action,
          expense: expense
        }
      }
    }
  })

  .state('app.revenue', {
    url: '/revenue',
    views: {
      'menuContent': {
        templateUrl: 'templates/revenue.html'
      }
    }
  })

  .state('app.statistics', {
      url: '/statistics',
      views: {
        'menuContent': {
          templateUrl: 'templates/statistics.html'
        }
      }
    })
    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingController as settings'
        }
      }
    })
    .state('app.set-budget', {
      url: '/set-budget',
      views: {
        'menuContent': {
          templateUrl: 'templates/set-budget.html',
          controller: 'SetBudgetController as setbudget'
        }
      }
    });
  $urlRouterProvider.otherwise('/app/expense');
  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.backButton.text('').previousTitleText(false);
});

expense.$inject = ['$stateParams', 'ExpenseService'];

function expense($stateParams, ExpenseService) {
  if ('' === $stateParams.expenseId) return;
  return ExpenseService.getExpense($stateParams.expenseId);
}

action.$inject = ['$stateParams'];

function action($stateParams) {
  return {
    name: $stateParams.action,
    isAdd: $stateParams.isAdd
  };
}
