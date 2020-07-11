
//BUDGET CONTROLLER
var budgetController = (function() {

    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expenses.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    }

    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };
   

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // creating the new ID

            //ID = last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // create new item based on 'exp' or 'inc'
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // pushing newitem to data structure
            data.allItems[type].push(newItem);

            // returning the newitem
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            //1. Calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //2. calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the percentage of income we spent
            if (data.totals.inc > 0) {

                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {

                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages : function() {

            var allPerc = data.allItems.exp.map(function(cur) {

                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {

            return {

                budget: data.budget,
                expenses: data.totals.exp,
                income: data.totals.inc,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    }

})();


//UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };


    var formatNumber = function(num, type) {

        var integer, numSplit, decimal;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        integer = numSplit[0];
        if (integer.length > 3) {
            integer = integer.substr(0, integer.length-3) + ',' + integer.substr(integer.length-3, 3);
        }

        decimal = numSplit[1];

        return (type === 'exp' ? '-': '+') + ' ' + integer + '.' + decimal; 
     };


     var nodeListForEach = function(list, callback) {

        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {

        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.type).value,    // can be inc or exp
                description: document.querySelector(DOMstrings.description).value,
                value: parseFloat(document.querySelector(DOMstrings.value).value)
            };
            
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        addListItem: function(obj, type) {

            var html, newHTML, element;
            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o" aria-hidden="true"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o" aria-hidden="true"></i></button></div></div></div>';

            }

            //replace plcaeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
         },

         deleteListItem: function(selector) {

            var el = document.getElementById(selector)
            el.parentNode.removeChild(el);

         },

         clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.value);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        
         },

         displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp'; 

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.expenses, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

         },


         displayPercentages: function(percentage) {

            var field = document.querySelectorAll(DOMstrings.expPercLabel);

            nodeListForEach(field, function(current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
         },

        displayMonth: function() {

            var now, year, monthName, month;

            now = new Date();
            
            monthName = ['January', 'February', 'March', 'April', 'May' ,'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.monthLabel).textContent = monthName[month] + ' ' + year;

         },

         changeType: function() {

            var fields = document.querySelectorAll(
            DOMstrings.type + ',' + 
            DOMstrings.description + ',' +                                                                            
            DOMstrings.value);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.btn).classList.toggle('red');

        },

         getDOMstrings: function() {
             return DOMstrings;
         }
        
    };
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.btn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {

            ctrlAddItem();
        }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType);


    };

    var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Update th UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        //1. calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget conntroller
        var percents = budgetCtrl.getPercentages();

        //3. update the UI
        UICtrl.displayPercentages(percents);

    };


    var ctrlAddItem = function() {

        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

             //2. Add item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            //3. Update the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. calculate and update the budget
            updateBudget();

            //6. update and show the percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        //1. delete the item from the data structure
        budgetCtrl.deleteItem(type, ID);

        //2. delete item from UI
        UICtrl.deleteListItem(itemID);

        //3. update and show the budget
        updateBudget();
        
        //4. update and show the percentage
        updatePercentages();


    };


    return {
        init: function() {
            
            setUpEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                expenses: 0,
                income: 0,
                percentage: -1
            });
            
        }
    }

})(budgetController, UIController);

controller.init();
