angular.module('starter.controllers', [])

.controller('AppCtrl', AppCtrl)

.controller('ExpenseController', ExpenseController)

.controller('DetailController', DetailController)

.controller('EditController', EditController)

.controller('DescriptionController', DescriptionController)

.controller('SettingController', SettingController)

.controller('SetBudgetController', SetBudgetController);

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

ExpenseController.$inject = ['$rootScope', 'ExpenseService', 'BudgetService', '$state', '$ionicSlideBoxDelegate'];

function ExpenseController($rootScope, ExpenseService, BudgetService, $state, $ionicSlideBoxDelegate) {
  var vm = this;

  vm.lists = [];
  vm.currDay = moment().format("YYYY-MM-DD");
  vm.currIndex = 0;

  updateLists();
  refreshBudget();

  vm.goToAddExpense = goToAddExpense;

  vm.goToDetail = goToDetail;

  vm.slideHasChanged = slideHasChanged;

  vm.cleanup = cleanup;

  $rootScope.$on('budget.updated', refreshBudget);

  function cleanup() {
    ExpenseService.destroyexpense();
    BudgetService.destroyBudget();
  }

  function updateLists() {
    ExpenseService.getExpenseList(vm.currDay).then(function (expenses) {
      vm.lists.unshift({
        currday: vm.currDay,
        items: expenses[vm.currDay]
      });
      $ionicSlideBoxDelegate.update();
    });
  }

  function slideHasChanged(index) {
    vm.currDay = vm.lists[index].currday;
  }

  function goToAddExpense() {
    $state.go('app.add-or-edit', {
      day: vm.currDay,
      action: '新增支出',
      isAdd: '1'
    });
  }

  function goToDetail(item) {
    $state.go('app.detail', {
      day: vm.currDay,
      expenseId: item._id,
      rev: item._rev
    });
  }

  function refreshBudget() {
    BudgetService.getBudget().then(function (budget) {
      vm.budget = budget;
      vm.percentage = budget !== 0 ? (parseInt(budget.remainingBudget) / parseInt(budget.money)) : 0;
    });
  }
}

DetailController.$inject = ['$scope', '$state', '$stateParams', 'expense', 'ExpenseService', 'BudgetService'];

function DetailController($scope, $state, $stateParams, expense, ExpenseService, BudgetService) {
  var vm = this;

  vm.item = expense;
  vm.goToEditExpense = goToEditExpense;
  vm.deleteItem = deleteItem;

  function goToEditExpense() {
    $state.go('app.add-or-edit', {
      expenseId: vm.item._id,
      action: '编辑',
      isAdd: '0',
      day: $stateParams.day
    });
  }

  function deleteItem(item) {
    ExpenseService.deleteExpense(item);
    BudgetService.reduceBudgetBy(item.money);
    $state.go('app.expense');
  }
}

EditController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'expense', 'action', '$ionicPopup', 'ExpenseService', 'BudgetService', 'TagService', 'AcountService', 'SharedDataService', 'regularExpensesService', '$ionicHistory'];

function EditController($scope, $rootScope, $state, $stateParams, expense, action, $ionicPopup, ExpenseService, BudgetService, TagService, AcountService, SharedDataService, regularExpensesService, $ionicHistory) {

  var vm = this;

  vm.showkeyboard = true;
  vm.action = action;
  vm.tag_list = TagService.getTagList();
  vm.accounts = AcountService.getAccounts();
  vm.regularExpenses = regularExpensesService.getRegularExpenses();
  $rootScope.$on('description.changed', updateDescription);

  if ('1' === vm.action.isAdd) {
    vm.item = {
      money: '0',
      icon: 'ion-coffee',
      name: '早餐',
      description: '',
      account: '现金',
      regularExpense: '无',
      day: $stateParams.day,
      date: moment().format()
    };
  } else {
    vm.item = expense;
    vm.oldExpense = vm.item.money;

  }

  vm.select = select;

  vm.isSelected = isSelected;

  vm.goToDescription = goToDescription;

  vm.showAccounts = showAccounts;

  vm.showRegularExpense = showRegularExpense;

  vm.saveExpense = saveExpense;

  function updateDescription() {
    vm.item.description = SharedDataService.getDescription();
  }

  function select(name, icon) {
    vm.item.name = name;
    vm.item.icon = icon;
  }

  function isSelected(name) {
    return vm.item.name === name;
  }

  function goToDescription() {
    SharedDataService.setDescription(vm.item.description);
    $state.go('app.description', {
      expenseId: vm.item._id,
      action: '编辑',
      isAdd: vm.action.isAdd
    });
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
    if ('1' === vm.action.isAdd) {
      ExpenseService.addExpense(vm.item);
      BudgetService.reduceBudgetBy(-vm.item.money);
    } else {
      ExpenseService.updateExpense(vm.item);
      BudgetService.reduceBudgetBy(vm.oldExpense - vm.item.money);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
    }
    $state.go('app.expense');
  }
}

DescriptionController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'SharedDataService'];

function DescriptionController($scope, $rootScope, $state, $stateParams, SharedDataService) {
  var vm = this,
    itemId = $stateParams.expenseId,
    action = $stateParams.action,
    isAdd = $stateParams.isAdd;

  vm.description = SharedDataService.getDescription();

  vm.saveDescription = saveDescription;

  function saveDescription() {
    SharedDataService.setDescription(vm.description);
    $state.go('app.add-or-edit', {
      expenseId: itemId,
      action: action,
      isAdd: isAdd
    });
  }
}

SettingController.$inject = ['$scope', '$state'];

function SettingController($scope, $state) {
  var vm = this;

  vm.gotoSetBudget = gotoSetBudget;

  function gotoSetBudget() {
    $state.go('app.set-budget');
  }
}
SetBudgetController.$inject = ['$scope', '$ionicPlatform', 'BudgetService', '$timeout'];

function SetBudgetController($scope, $ionicPlatform, BudgetService, $timeout) {
  var vm = this,
    i = 1,
    delayInMs = 1000,
    timeoutPromise = null;

  $ionicPlatform.ready(function () {
    BudgetService.getBudget().then(function (budget) {
      vm.budget = budget;

      $scope.$watchCollection(function () {
        return vm.budget;
      }, saveBudget);
    });
  });

  vm.days = [];

  for (; i < 31; i++) {
    vm.days.push(i);
  }

  vm.showkeyboard = true;
  vm.saveBudget = saveBudget;

  function saveBudget() {
    $timeout.cancel(timeoutPromise);
    timeoutPromise = $timeout(function () {
      BudgetService.updateBudget(vm.budget);
    }, delayInMs);
  }
}
