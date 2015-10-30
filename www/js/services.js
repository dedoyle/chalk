angular
  .module('starter.services', [])

.factory('ExpenseService', ExpenseService)
.factory('TagService', TagService)
.factory('AcountService', AcountService)
.factory('regularExpensesService', regularExpensesService)
.service('SharedDataService', SharedDataService);

ExpenseService.$inject = ['$q', '$rootScope'];

function ExpenseService($q, $rootScope) {
  var _db,
    _expenses;

  return {
    initDB: initDB,
    addExpense: addExpense,
    updateExpense: updateExpense,
    deleteExpense: deleteExpense,
    getAllExpense: getAllExpense,
    destroyexpense: destroyexpense
  };

  function initDB() {
    _db = new PouchDB('expense', {
      adapter: 'websql'
    });
  }

  function destroyexpense() {
    _db.destroy(function(err, response) {
      if(err) {
        return console.log(err);
      }
    });
  }

  function addExpense(expense) {
    $rootScope.$emit('expense.updated');
    return $q.when(_db.post(expense));
  }

  function updateExpense(expense) {
    $rootScope.$emit('expense.updated');
    return $q.when(_db.put(expense));
  }

  function deleteExpense(expense) {
    $rootScope.$emit('expense.updated');
    return $q.when(_db.remove(expense));
  }

  function getAllExpense() {
    if (!_expenses) {
      return $q.when(_db.allDocs({
          include_docs: true
        }))
        .then(function (docs) {
          _expenses = docs.rows.map(function (row) {
            row.doc.date = new Date(row.doc.date);
            return row.doc;
          });

          _db.changes({
              live: true,
              since: 'now',
              include_docs: true
            })
            .on('change', onDatabaseChange);

          return _expenses;
        });
    } else {
      return $q.when(_expenses);
    }
  }

  function onDatabaseChange(change) {
    var index = findIndex(_expenses, change.id),
      expense = _expenses[index];

    if (change.deleted) {
      if (expense) {
        _expenses.splice(index, 1);
      }
    } else {
      if (expense && expense._id === change.id) {
        _expenses[index] = change.doc;
      } else {
        _expenses.splice(index, 0, change.doc);
      }
    }
  }

  function findIndex(arr, id) {
    var low = 0,
      high = arr.length,
      mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      arr[mid]._id < id ? low = mid + 1 : high = mid;
    }

    return low;
  }
}

function TagService() {
  var tag_list = [
    [
      [{
          name: '早餐',
          icon: 'ion-coffee'
      },
        {
          name: '午餐',
          icon: 'ion-beer'
      },
        {
          name: '晚餐',
          icon: 'ion-wineglass'
      },
        {
          name: '交通',
          icon: 'ion-android-bus'
      },
        {
          name: '零食',
          icon: 'ion-icecream'
      }],
      [{
          name: '日常用品',
          icon: 'ion-android-cart'
      },
        {
          name: '衣物',
          icon: 'ion-tshirt'
        },
        {
          name: '社交',
          icon: 'ion-person-stalker'
        },
        {
          name: '娱乐',
          icon: 'ion-mic-b'
        },
        {
          name: '购物',
          icon: 'icon-local_mall'
        }]
      ],
      [
      [{
          name: '房租',
          icon: 'ion-ios-home'
        },
        {
          name: '电话费',
          icon: 'ion-android-call'
        },
        {
          name: '投资',
          icon: 'icon-line-chart'
        },
        {
          name: '书',
          icon: 'icon-book'
        },
        {
          name: '电影',
          icon: 'ion-android-film'
        }],
      [{
          name: '转账',
          icon: 'icon-loop'
        },
        {
          name: '仪表',
          icon: 'ion-android-happy'
        },
        {
          name: '医疗',
          icon: 'icon-local_hospital'
        },
        {
          name: '信用卡',
          icon: 'icon-cc-visa'
        },
        {
          name: 'others',
          icon: 'ion-ios-pricetag'
        }]
      ]
    ];

  return {
    tag_list: tag_list
  };
}

function AcountService() {
  var accounts = ['现金', '银行卡'];

  return {
    accounts: accounts
  };
}

function regularExpensesService() {
  var regularExpenses = ['无', '每日', '每周', '每月'];

  return {
    regularExpenses: regularExpenses
  };
}

SharedDataService.$inject = ['$rootScope'];

function SharedDataService($rootScope) {
  var service = {
    expense: {
      description: ''
    },
    action: {},
    getExpense: getExpense,
    setExpense: setExpense,
    getAction: getAction,
    setAction: setAction,
    getDescription: getDescription,
    setDescription: setDescription
  };

  return service;

  function getExpense() {
    return this.expense;
  }

  function setExpense(expense) {
    this.expense = expense;
  }

  function getAction() {
    return this.action;
  }

  function setAction(action) {
    this.action = action;
  }

  function getDescription() {
    return this.expense.description;
  }

  function setDescription(desc) {
    this.expense.description = desc;
    $rootScope.$emit('description.changed');
  }
}
