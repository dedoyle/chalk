angular
  .module('starter.directives', [])
  .directive('keyboardNumber', keyboardNumber);

function keyboardNumber() {
  var directive = {
    restrict: 'EA',
    scope: {
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
  // 2. num [=-*/] num
  $scope.input = '';
  $scope.isLastInputNum = true;
  // isExpression 表示input为第二种情况，是一个式子
  $scope.isExpression = false;

  $scope.write = write;

  $scope.compute = compute;

  $scope.reset = reset;

  $scope.hideKeyboard = hideKeyboard;

  function compute() {
    var result = 0;
    $scope.input += '';
    $scope.input = $scope.input.replace(/[\+\-\*\/]$/, '');
    result = $scope.$eval($scope.input);
    //精确到小数点后两位
    $scope.input = $scope.calculation = Math.round(result * 100) / 100;
    $scope.isExpression = false;
  }

  function isNum(c) {
    return /[0-9.]/.test(c);
  }

  function isCalculationZero() {
    return '0' === $scope.calculation;
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
    $scope.input = '',
      $scope.isLastInputNum = true;
    $scope.isExpression = false;
    $scope.calculation = '0';
  }

  function hideKeyboard() {
    $scope.showkeyboard = false;
  }
}
