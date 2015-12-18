angular
  .module('starter.services', [])
  .factory('TagService', TagService)
  .factory('BudgetService', BudgetService)
  .factory('AcountService', AcountService)
  .factory('ExpenseService', ExpenseService)
  .factory('SharedDataService', SharedDataService)
  .factory('regularExpensesService', regularExpensesService);

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

  function getTagList() {
    return tag_list;
  }

  return {
    getTagList: getTagList
  };
}

BudgetService.$inject = ['$q', '$rootScope'];

function BudgetService($q, $rootScope) {
  var _db,
    _budget,
    defaultBudget = {
      _id: 'debudget',
      money: 3000,
      totalExpense: 0,
      regularDay: 1,
      remainingBudget: 3000
    };

  return {
    initDB: initDB,
    getBudget: getBudget,
    updateBudget: updateBudget,
    reduceBudgetBy: reduceBudgetBy,
    destroyBudget: destroyBudget
  };

  function initDB() {
    _db = new PouchDB('budget', {
      adapter: 'websql'
    });
    addBudget(defaultBudget);
  }

  function addBudget(budget) {
    return $q.when(_db.put(budget));
  }

  function getBudget() {
    return $q.when(_db.get(defaultBudget._id));
  }

  function updateBudget(budget) {
    budget.remainingBudget = budget.money - budget.totalExpense;

    return getBudget()
      .then(function (doc) {
        // rev 必须使用doc._rev而不是budget._rev
        return _db.put({
          _id: defaultBudget._id,
          _rev: doc._rev,
          money: budget.money,
          totalExpense: budget.totalExpense,
          regularDay: budget.regularDay,
          remainingBudget: budget.remainingBudget
        });
      }).then(function (response) {
        $rootScope.$emit('budget.updated');
      }).catch(function (err) {
        console.error(err);
      });
  }

  function reduceBudgetBy(expense) {
    getBudget().then(function (budget) {
      budget.totalExpense -= expense;
      updateBudget(budget);
    });
  }

  function destroyBudget() {
    _db.destroy(function (err, response) {
      if (err) {
        return console.log(err);
      }
    });
  }
}

function AcountService() {
  var account = {};

  account.getAccounts = function () {
    return ['现金', '银行卡'];
  };

  return account;
}

ExpenseService.$inject = ['$q'];

function ExpenseService($q) {
  var _db,
    _expenses = [];

  return {
    initDB: initDB,
    addExpense: addExpense,
    getExpense: getExpense,
    updateExpense: updateExpense,
    deleteExpense: deleteExpense,
    getExpenseList: getExpenseList,
    destroyexpense: destroyexpense
  };

  function initDB() {
    _db = new PouchDB('expense', {
      adapter: 'websql'
    });
  }

  function destroyexpense() {
    _db.destroy(function (err, response) {
      if (err) {
        return console.log(err);
      }
    });
  }

  function addExpense(expense) {
    return $q.when(_db.post(expense));
  }

  function updateExpense(expense) {
    return $q.when(_db.put(expense));
  }

  function getExpense(id) {
    return $q.when(_db.get(id));
  }

  function deleteExpense(expense) {
    return $q.when(_db.remove(expense));
  }

  function getExpenseList(day) {
    return $q.when(_db.allDocs({
        include_docs: true
      }))
      .then(function (docs) {
        _expenses[day] = docs.rows.map(function (row) {
          row.doc.date = moment(row.doc.date);
          return row.doc;
        });

        _expenses[day] = _expenses[day].filter(function (row) {
          return row.day === day;
        });

        _db.changes({
            live: true,
            since: 'now',
            include_docs: true
          })
          .on('change', onDatabaseChange);

        return _expenses;
      }).catch(function (err) {
        console.log(err);
      });
  }

  function onDatabaseChange(change) {
    var expensesOneDay = _expenses[change.doc.day];
    var index = findIndex(expensesOneDay, change.id),
      expense = expensesOneDay[index];

    if (change.deleted) {
      if (expense) {
        // delete
        expensesOneDay.splice(index, 1);
      }
    } else {
      if (expense && expense._id === change.id) {
        // update
        expensesOneDay[index] = change.doc;
      } else {
        // insert
        expensesOneDay.splice(index, 0, change.doc);
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

SharedDataService.$inject = ['$rootScope'];

function SharedDataService($rootScope) {
  var share = {
    description: ''
  };

  return {
    getDescription: getDescription,
    setDescription: setDescription
  };

  function getDescription() {
    return share.description;
  }

  function setDescription(desc) {
    share.description = desc;
    $rootScope.$emit('description.changed');
  }
}

function regularExpensesService() {
  var regularExpenses = {};

  regularExpenses.getRegularExpenses = function () {
    return ['无', '每日', '每周', '每月'];
  };

  return regularExpenses;
}
