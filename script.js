	/* Shivving (IE8 is not supported, but at least it won't look as awful)
	/* ========================================================================== */
	var count=1;
	var grandTotal = 0;
	var smallNum = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
	var bigNum = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];


	(function (document) {
		var
		head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
		elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
		elementsLength = elements.length,
		elementsIndex = 0,
		element;

		while (elementsIndex < elementsLength) {
			element = document.createElement(elements[++elementsIndex]);
		}

		element.innerHTML = 'x<style>' +
			'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
			'audio[controls],canvas,video{display:inline-block}' +
			'[hidden],audio{display:none}' +
			'mark{background:#FF0;color:#000}' +
		'</style>';

		return head.insertBefore(element.lastChild, head.firstChild);
	})(document);

	/* Prototyping
	/* ========================================================================== */

	(function (window, ElementPrototype, ArrayPrototype, polyfill) {
		function NodeList() { [polyfill] }
		NodeList.prototype.length = ArrayPrototype.length;

		ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
		ElementPrototype.mozMatchesSelector ||
		ElementPrototype.msMatchesSelector ||
		ElementPrototype.oMatchesSelector ||
		ElementPrototype.webkitMatchesSelector ||
		function matchesSelector(selector) {
			return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
		};

		ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
		ElementPrototype.mozAncestorQuerySelectorAll ||
		ElementPrototype.msAncestorQuerySelectorAll ||
		ElementPrototype.oAncestorQuerySelectorAll ||
		ElementPrototype.webkitAncestorQuerySelectorAll ||
		function ancestorQuerySelectorAll(selector) {
			for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
				if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
			}

			return newNodeList;
		};

		ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
		ElementPrototype.mozAncestorQuerySelector ||
		ElementPrototype.msAncestorQuerySelector ||
		ElementPrototype.oAncestorQuerySelector ||
		ElementPrototype.webkitAncestorQuerySelector ||
		function ancestorQuerySelector(selector) {
			return this.ancestorQuerySelectorAll(selector)[0] || null;
		};
	})(this, Element.prototype, Array.prototype);

	/* Helper Functions
	/* ========================================================================== */

	function generateTableRow(count) {
		var emptyColumn = document.createElement('tr');

		emptyColumn.innerHTML = '<td><a class="cut">-</a><span>'+count+'</span></td>'+
			'<td><span contenteditable>GST/</span></td>'+
			'<td colspan="2"><span contenteditable>4 3/4</span></td>'+
			'<td colspan="2"><span contenteditable>HT</span></td>'+
			'<td><span contenteditable>0</span></td>'+
			'<td><span contenteditable>0</span></td>'+
			'<td  colspan="2"><span data-prefix>₹</span><span>0.00</span></td>'+
			'<td><span contenteditable>0</span></td>'+
			'<td><span data-prefix>₹</span><span>0.00</span></td>'+
			'<td><span>0</span></td>'+
			'<td><span data-prefix>₹</span><span>0.00</span></td>'+
			'<td><span contenteditable>0</span></td>'+
			'<td><span data-prefix>₹</span><span>0.00</span></td>';

		return emptyColumn;
	}

	function parseFloatHTML(element) {
		return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
	}

	function parsePrice(number) {
		return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	/* Update Invoice
	/* ========================================================================== */

	function updateInvoice() {
		var total = 0;
		var totalTax = 0;
		var grandTax = 0;
		var quantity = 0;
		var totalQuantity = 0;
		var cells, taxPer, price, taxPrice, a, i, iTax, iTaxPer;

		// update inventory cells
		// ======================

		for (var a = document.querySelectorAll('table.inventory tbody tr'), i = 0; a[i]; ++i) {
			// get inventory row cells
			cells = a[i].querySelectorAll('span:last-child');

			quantity = parseFloatHTML(cells[4]);

			// set price as cell[2] * cell[3]
			price = quantity * parseFloatHTML(cells[5]);
			
			// add price to total
			total += price;

			// set row total
			cells[6].innerHTML = price;

			cells[9].innerHTML = cells[7].innerHTML;
			taxPer = parseFloatHTML(cells[9]);		

			taxPrice = price * (taxPer/100);
			cells[8].innerHTML = cells[10].innerHTML =  taxPrice;

			totalQuantity += quantity;
			cells[4].innerHTML = quantity;
			
			iTaxPer = parseFloatHTML(cells[11]);
			iTax = price * (iTaxPer/100);
			cells[12].innerHTML = iTax;

			totalTax = (taxPrice*2) + iTax;
			grandTax += totalTax;
		}

		// update balance cells
		// ====================
		// get balance cells
		cells = document.querySelectorAll('table.balance td:last-child span:last-child');

		// set total
		cells[0].innerHTML = total;
		grandTotal = grandTax+total;

		// set balance and meta balance
		document.querySelector('table.meta tr:last-child td:last-child span:last-child').innerHTML = parsePrice(grandTotal);

		cells[1].innerHTML = parsePrice(grandTax);
		cells[2].innerHTML = parsePrice(grandTotal);

		cells[3].innerHTML = document.querySelector('table.balance tr:last-child td:last-child span:last-child').innerHTML = inWords(grandTotal);
		// update prefix formatting
		// ========================

		var prefix = document.querySelector('#prefix').innerHTML;
		for (a = document.querySelectorAll('[data-prefix]'), i = 0; a[i]; ++i) a[i].innerHTML = prefix;

		// update price formatting
		// =======================

		for (a = document.querySelectorAll('span[data-prefix] + span'), i = 0; a[i]; ++i) if (document.activeElement != a[i]) a[i].innerHTML = parsePrice(parseFloatHTML(a[i]));

		var tfootCells = document.querySelectorAll('table.inventory tfoot td');
		tfootCells[0].innerHTML = totalQuantity;
		tfootCells[1].querySelector('span:last-child').innerHTML = parsePrice(total);
		tfootCells[2].querySelector('span:last-child').innerHTML = parsePrice(taxPrice);
		tfootCells[3].querySelector('span:last-child').innerHTML = parsePrice(taxPrice);
		tfootCells[4].querySelector('span:last-child').innerHTML = parsePrice(iTax);

	}


	function inWords(num) {
		if ((num = num.toString()).length > 9) return 'overflow';
		n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
		if (!n) return; 
		var str = '';
		str += (n[1] != 0) ? (smallNum[Number(n[1])] || bigNum[n[1][0]] + ' ' + smallNum[n[1][1]]) + 'Crore ' : '';
		str += (n[2] != 0) ? (smallNum[Number(n[2])] || bigNum[n[2][0]] + ' ' + smallNum[n[2][1]]) + 'Lakh ' : '';
		str += (n[3] != 0) ? (smallNum[Number(n[3])] || bigNum[n[3][0]] + ' ' + smallNum[n[3][1]]) + 'Thousand ' : '';
		str += (n[4] != 0) ? (smallNum[Number(n[4])] || bigNum[n[4][0]] + ' ' + smallNum[n[4][1]]) + 'Hundred ' : '';
		str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (smallNum[Number(n[5])] || bigNum[n[5][0]] + ' ' + smallNum[n[5][1]]) + 'Only ' : '';
		return str;
	}


	/* On Content Load
	/* ========================================================================== */

	function onContentLoad() {
		updateInvoice();

		function onClick(e) {
			var element = e.target.querySelector('[contenteditable]'), row;

			element && e.target != document.documentElement && e.target != document.body && element.focus();

			if (e.target.matchesSelector('.add')) {
				count +=1;
				document.querySelector('table.inventory tbody').appendChild(generateTableRow(count));
			}
			else if (e.target.className == 'cut') {
				count -=1;
				row = e.target.ancestorQuerySelector('tr');
				row.parentNode.removeChild(row);
			}

			updateInvoice();
		}

		document.getElementById('printButton').addEventListener('click', function () {
			window.print();
		});

		if (window.addEventListener) {
			document.addEventListener('click', onClick);

		}
	}

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);
