angular
  .module('starter.directives', [])
  .directive('keyboardNumber', keyboardNumber)
  .directive('deSwipeRight', deSwipeRight);

function keyboardNumber() {
  var directive = {
    restrict: 'EA',
    scope: {
      onlynumber: '@',
      calculation: '=',
      showkeyboard: '='
    },
    templateUrl: 'templates/keyboard.html',
    replace: true,
    controller: KeyboardController
  };

  return directive;
}

KeyboardController.$inject = ['$scope'];

function KeyboardController($scope) {
  // input有两种情况：
  // 1. num
  // 2. num [+-*/] num
  $scope.input = isCalculationZero() ? '' : $scope.calculation;
  $scope.isLastInputNum = true;
  // isExpression 表示input为第二种情况，是一个式子
  $scope.isExpression = false;

  $scope.write = write;

  $scope.compute = compute;

  $scope.reset = reset;

  $scope.hideKeyboard = hideKeyboard;

  function compute() {
    var result = 0;
    // 将数字转为字符串
    $scope.input += '';
    // 去除末尾运算符，如：'1+'
    $scope.input = $scope.input.replace(/[\+\-\*\/]$/, '');
    result = $scope.$eval($scope.input);
    //精确到小数点后两位
    $scope.calculation = Math.round(result * 100) / 100;
    $scope.input = $scope.calculation;
    $scope.isExpression = false;
  }

  function isNum(c) {
    return /[0-9.]/.test(c);
  }

  function isCalculationZero() {
    return 0 === $scope.calculation || '0' === $scope.calculation;
  }

  function isOperator(c) {
    return /[\+\-\*\/]/.test(c);
  }

  function write(c) {
    if (isNum(c)) {
      if (isCalculationZero() || !$scope.isLastInputNum) {
        $scope.calculation = '';
      }
      $scope.calculation += c;
      $scope.input += c;
      $scope.isLastInputNum = true;
    } else if (isOperator(c)) {
      // 当当前操作数是0时直接跳过
      if (isCalculationZero()) return;

      if ($scope.isLastInputNum) {
        compute();
        $scope.input += c;
      } else {
        $scope.input = $scope.input.replace(/[\+\-\*\/]$/, c);
      }
      $scope.isExpression = true;
      $scope.isLastInputNum = false;
    }
  }

  function reset() {
    $scope.input = '';
    $scope.isLastInputNum = true;
    $scope.isExpression = false;
    $scope.calculation = '0';
  }

  function hideKeyboard() {
    $scope.showkeyboard = false;
  }
}

function deSwipeRight() {
  var directive = {
    restrict: 'EA',
    scope: {
      currday: '=',
      lists: '=',
      index: '@'
    },
    link: swipeLinkFunc,
    controller: swipeController,
    controllerAs: 'deswipe'
  };

  function swipeLinkFunc(scope, element, attrs) {
    ionic.onGesture('swiperight', function () {
      if (scope.index === '0') {
        scope.deswipe.updateList();
      }
    }, element[0]);
  }

  return directive;
}

swipeController.$inject = ['$scope', 'ExpenseService', '$ionicSlideBoxDelegate'];

function swipeController($scope, ExpenseService, $ionicSlideBoxDelegate) {
  var vm = this;
  vm.updateList = updateList;

  function updateList() {
    $scope.currday = moment($scope.currday).subtract(1, 'd').format('YYYY-MM-DD');
    ExpenseService.getExpenseList($scope.currday).then(function (expenses) {
      $scope.lists.unshift({
        currday: $scope.currday,
        items: expenses[$scope.currday]
      });
      $ionicSlideBoxDelegate.update();
    });
  }
}
