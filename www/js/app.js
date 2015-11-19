// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'starter.directives', 'starter.filters', 'morphCarousel'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
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
        controller: 'ExpenseController as expense'
      }
    }
  })

  .state('app.detail', {
    url: '/detail',
    views: {
      'menuContent': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailController as detail'
      }
    }
  })

  .state('app.add-or-edit', {
    url: '/add-or-edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/add-or-edit.html',
        controller: 'EditController as edit'
      }
    }
  })

  .state('app.description', {
    url: '/description',
    views: {
      'menuContent': {
        templateUrl: 'templates/description.html',
        controller: 'DescriptionController as desc'
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
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/expense');
  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.backButton.text('').previousTitleText(false);
});
