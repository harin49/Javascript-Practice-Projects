var budgetController = (function(){

	var Expense = function(id, description, value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var Income = function(id, description, value)
	{
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var data = {
		allItems : 
		{
			exp : [],
			inc : []
		},

		totals : 
		{
			exp : 0,
			inc : 0
		}, 

		budget : 0
	};

	var calculateTotal = function(type){
		var sum = 0; 
		data.allItems[type].forEach(function(cur){
			sum+=cur.value;
		});
		data.totals[type] = sum;
	}

	return {

		addItem : function(type, description, value)
		{
			var newItem;
			ID = 0;
			if(data.allItems[type].length > 0)
			{
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1 ;
			} else{
					ID = 0 ;
				}
			
			if(type === 'exp')
			{
				 newItem = new Expense(ID, description, value);
			} else if(type === 'inc')
			{
				newItem = new Income(ID, description, value);
			}

			data.allItems[type].push(newItem);
			return newItem;
			
		},


		deleteItem : function(type, id)
		{
			var ids = data.allItems[type].map(function(current)
			{
				return current.id;
			});

			var index = ids.indexOf(id);

			if(index !== -1)
			{
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget : function(){

			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;

		},

		getBudget : function()
		{
			return {
				budget : data.budget,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp
			}
		},

			testing : function(){
				console.log(data);
			}
	}

})();

var uiController = (function(){

	var DomStrings = {
				inputType : '.add-type',
				inputDescription : '.add-description',
				inputValue : '.add-value',
				inputButton : '.add-button',
				incomeContainer : '.income-list',
				expenseContainer : '.expense-list', 
				budgetLabel : '.budget-value', 
				incomeLabel : '.income-value',
				expenseLabel : '.expense-value',
				monthLabel : '.budget-title-month',
				container : '.list-container'

	};

	var formatNumber = function(num, type){
			var int, dec, numSplit;
			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');
			int = numSplit[0];

			if(int.length>3)
			{
				int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
			}

			dec = numSplit[1];

			return (type === 'exp' ? '-' : '+') + int + '.' + dec;
			

		};

		var nodeListForEach = function(list, callback)
		{
			for ( var i = 0; i<list.length; i++ )
			{
				callback(list[i], i);
			}
		}

	return {
		getInput : function()
		{
			return {
				type : document.querySelector(DomStrings.inputType).value,
				description : document.querySelector(DomStrings.inputDescription).value,
				value : parseFloat(document.querySelector(DomStrings.inputValue).value),
			};
		},

		addListItem : function(obj, type)
		{	
			var html, element, newHtml;

			if ( type === 'inc')
			{
				element = DomStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%" ><div class="item-description"> %description% </div><div class="right clearfix"><div class="item-value"> %value% </div><div class="item-delete"><button class="item-delete-button"> <i class="ion-ios-close-outline"></i></button></div> </div>';
			}

			else if (type === 'exp')
			{
				element = DomStrings.expenseContainer;
				html = ' <div class="item clearfix" id="exp-%id%"><div class="item-description"> %description% </div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-button"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				
			}


			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		displayBudget : function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : 'exp' ;

			document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
		},

		deleteListItem : function(selectorID)
		{
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el);

		},

		clearFields : function(){

			var fields, fieldsArr;
			fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array){

				current.value = "";

			});

			fieldsArr[0].focus();

		},

		displayMonth : function()
		{
			var month, year, now;
			now = new Date();
			month = now.toLocaleString("en-us", {month: "long"});
			year = now.getFullYear();
			document.querySelector(DomStrings.monthLabel).textContent = month + ' ' + year;
		},

		changeType : function()
		{
			var fields = document.querySelectorAll(
				DomStrings.inputType + ',' +
				DomStrings.inputDescription + ',' +
				DomStrings.inputValue);

			nodeListForEach(fields, function(cur)
			{
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DomStrings.inputButton).classList.toggle('red');
		},

		getDomStrings : function()
		{
			return DomStrings;
		}
	};

})();

var appController = (function(budgetCtrl, uiCtrl){


	var setupEventListeners = function()
	{
		var DOM = uiCtrl.getDomStrings();
		document.querySelector(DOM.inputButton).addEventListener('click', addCtrlItem)
		document.addEventListener('keypress', function(event){

		if(event.keycode === 13 || event.which === 13)
		{
			addCtrlItem();
		} 
	})

		document.querySelector(DOM.container).addEventListener('click', deleteCtrlItem)
		document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType)

	};


	
	var updateBudget = function()
	{
		budgetCtrl.calculateBudget();
		var budget = budgetCtrl.getBudget();
		uiCtrl.displayBudget(budget);


	};


	var addCtrlItem = function()
	{		
		var input, newItem;
			 input = uiCtrl.getInput();

			 if(input.description !== "" && !isNaN(input.value) && input.value > 0)
			 {
			 	newItem = budgetCtrl.addItem(input.type, input.description, input.value );
				uiCtrl.addListItem(newItem, input.type);
			    uiCtrl.clearFields();
			    updateBudget();
			 }
			 		
			
	};

	var deleteCtrlItem = function(event)
	{
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID)
		{
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			budgetCtrl.deleteItem(type, ID);
			uiCtrl.deleteListItem(itemID);
			updateBudget();


		}
	};

	return {
		 init : function()
		{
			setupEventListeners();
			uiCtrl.displayMonth();
			uiCtrl.displayBudget(

{
         	budget:0,
          totalInc:0,
          totalExp:0,
         
     }

);
		}
	};
	

})(budgetController, uiController);


appController.init();