angular.module('starter.controllers', [])

.controller('AppCtrl', AppCtrl)

.controller('ExpenseController', ExpenseController)

.controller('EditController', EditController)

.controller('DetailController', DetailController)

.controller('DescriptionController', DescriptionController);

AppCtrl.$inject = ['$scope', '$ionicModal', '$timeout'];

function AppCtrl($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  $scope.$on('$ionicView.enter', function (e) {
    var t = new Date();
    $scope.today = t.getFullYear() + '/' + t.getMonth() + '/' + t.getDate();
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function () {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function () {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function () {

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function () {
      $scope.closeLogin();
    }, 1000);
  };
}

ExpenseController.$inject = ['$scope', '$rootScope', 'ExpenseService', 'SharedDataService', '$state', '$ionicPlatform', '$ionicPopup', '$filter'];

function ExpenseController($scope, $rootScope, ExpenseService, SharedDataService, $state, $ionicPlatform, $ionicPopup, $filter) {
  var i, len,
      vm = this;

  $ionicPlatform.ready(function () {
    ExpenseService.initDB();

    ExpenseService.getAllExpense().then(function (expenses) {
      vm.items = expenses;
    });

  });

  vm.budget = 2000;
  vm.remainingBudget = 1000;
  vm.percentage = (vm.remainingBudget / vm.budget) * 100;

  vm.goToAddExpense = goToAddExpense;

  vm.goToDetail = goToDetail;

  vm.cleanup = cleanup;

  function cleanup(){
    ExpenseService.destroyexpense();
  }

  function goToAddExpense() {
    var action = {
      name: '新增支出',
      isAdd: true
    };
    SharedDataService.setAction(action);
    $state.go('app.add-or-edit');
  }

  function goToDetail(item) {
    SharedDataService.setExpense(item);
    $state.go('app.detail');
  }
}

EditController.$inject = ['$scope', '$rootScope', '$state', '$ionicPopup', 'ExpenseService', 'SharedDataService', 'TagService', 'AcountService', 'regularExpensesService', '$ionicHistory'];

function EditController($scope, $rootScope, $state, $ionicPopup, ExpenseService, SharedDataService, TagService, AcountService, regularExpensesService, $ionicHistory) {

  var vm = this,
      now = new Date();

  vm.action = SharedDataService.getAction();

  if (vm.action.isAdd) {
    vm.expense = {
      money: '0',
      icon: 'ion-coffee',
      name: '早餐',
      description: '',
      account: '现金',
      regularExpense: '无',
      date: now
    };
  } else {
    vm.expense = SharedDataService.getExpense();
    console.log(vm.expense);
  }

  vm.showkeyboard = true;
  vm.tag_list = TagService.tag_list;
  vm.accounts = AcountService.accounts;
  vm.regularExpenses = regularExpensesService.regularExpenses;

  $rootScope.$on('description.changed', updateDescription);

  vm.select = select;

  vm.isSelected = isSelected;

  vm.goToDescription = goToDescription;

  vm.showAccounts = showAccounts;

  vm.showRegularExpense = showRegularExpense;

  vm.saveExpense = saveExpense;

  function updateDescription() {
    vm.expense.description = SharedDataService.getDescription();
  }

  function select(name, icon) {
    vm.expense.name = name;
    vm.expense.icon = icon;
  }

  function isSelected(name) {
    return vm.expense.name === name;
  }

  function goToDescription() {
    SharedDataService.setDescription(vm.expense.description);
    $state.go('app.description');
  }

  function showAccounts() {
    $ionicPopup.show({
      templateUrl: 'templates/accounts.html',
      title: '请选取账号',
      scope: $scope,
      buttons: [{
        text: '关闭',
        type: 'button-clear button-full'
      }]
    });
  }

  function showRegularExpense() {
    $ionicPopup.show({
      templateUrl: 'templates/regular-expense.html',
      title: '请选取自动输入的周期',
      scope: $scope,
      buttons: [{
        text: '关闭',
        type: 'button-clear button-full'
      }]
    });
  }

  function saveExpense() {
    if (vm.action.isAdd) {
      ExpenseService.addExpense(vm.expense);
    } else {
      ExpenseService.updateExpense(vm.expense);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
    }
    $state.go('app.expense');
  }
}

DescriptionController.$inject = ['$scope', '$rootScope', '$state', 'SharedDataService'];

function DescriptionController($scope, $rootScope, $state, SharedDataService) {
  var vm =this;

  vm.description = SharedDataService.getDescription();

  vm.saveDescription = saveDescription;

  $rootScope.$on('description.changed', updateDescription);

  function saveDescription() {
    SharedDataService.setDescription(vm.description);
    $state.go('app.add-or-edit');
  }

  function updateDescription() {
    vm.description = SharedDataService.getDescription();
  }
}

DetailController.$inject = ['$scope', '$state', 'SharedDataService', 'ExpenseService'];

function DetailController($scope, $state, SharedDataService, ExpenseService) {
  var vm = this;

  vm.item = SharedDataService.getExpense();
  vm.goToEditExpense = goToEditExpense;
  vm.deleteItem = deleteItem;

  return vm;

  function goToEditExpense() {
    var action = {
      name: '编辑',
      isAdd: false
    };
    SharedDataService.setAction(action);
    $state.go('app.add-or-edit');
  }

  function deleteItem(item) {
    ExpenseService.deleteExpense(item);
    $state.go('app.expense');
  }
}
