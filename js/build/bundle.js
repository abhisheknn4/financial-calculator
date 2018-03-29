(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
require("./sliders.js");

if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').catch(function(err) {console.err("Error registering service worker", err);});
}

},{"./sliders.js":3}],2:[function(require,module,exports){
function issetOrElse(val, elseVal){
	return typeof val != 'undefined' ? val : elseVal;
}

var variableList = [
	
	'DR', // Daily run
	'DRD', // Daily run days
	'VDU', // Duration of use
	'FLR', // Loan rate
	'FLT', // Loan tenure
	'FPE', // Down payment
	'FIF', // Inflation rate
	'FRI', // Investment savings rate
	
	/* Electric */
	'VCOE', // Vehicle cost (electric)
	'VM', // Vehicle mileage
	'RER', // Electricity rate
	'REE', // Electricity rate escalation rate
	'MEC', // Maintenance cost
	'MEO', // Other operational cost
	'FDE', // Depreciation rate
	'FBR', // Battery price reduction rate
	
	/* Fossil */
	'VCOF', // Vehicle cost (fossil)
	'VDM', // Vehicle mileage
	'RFR', // Diesel price
	'RFE', // Diesel price escalation rate
	'MFC', // Maintenance cost
	'MFO', // Other operational cost
	'FDD', // Depreciation rate
]

var vehicleCostMultiplier = 100*1000;

var variables = {};
$(document).ready(function(){
	variableList.forEach(function(varName){
		variables[varName] = $('.graph-row[variate-key='+varName+'] input[type=range]');
	});
});

function getEmi(params, vehicleType, numMonth){
	if(numMonth > params.FLT*12) return 0;
	principle = (vehicleType == 'e' ? params.VCOE : params.VCOF) * vehicleCostMultiplier * (1-(params.FPE/100));
	interest = params.FLR / 1200;
	var months = params.FLT * 12;
	var powerVal = Math.pow(1+interest, months);
	return (principle * interest * powerVal)/(powerVal - 1);
}

function getPviElectric(params, i){
	var emi = getEmi(params, 'e', i);
	var reeBlock = Math.pow(1+(params.REE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	var friBlock = Math.pow(1+(params.FRI/1200), i);
	return ((params.DR * params.DRD * ((params.VM * params.RER * reeBlock) + ((params.MEC + params.MEO) * fifBlock))) + emi) / friBlock;
}

function getSalvageElectric(params){
	return params.VCOE * vehicleCostMultiplier * Math.pow(1 - (params.FDE/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

function getPviFossil(params, i){
	var emi = getEmi(params, 'f', i);
	var rfeBlock = Math.pow(1+(params.RFE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	var friBlock = Math.pow(1+(params.FRI/1200), i);
	return ((params.DR * params.DRD * ((params.RFR * rfeBlock / params.VDM) + ((params.MFC + params.MFO) * fifBlock))) + emi) / friBlock;
}

function getSalvageFossil(params){
	return params.VCOF * vehicleCostMultiplier * Math.pow(1 - (params.FDD/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

module.exports = {
	getSavings: function(params){
		params = params || {};
		Object.keys(variables).forEach(function(varName){
			params[varName] = parseFloat(issetOrElse(params[varName], variables[varName].val()));
		});

		var delta = 0;
		for(var i=1; i<=params.VDU*12; i++){
			delta += getPviFossil(params, i) - getPviElectric(params, i);
		}
		
		/* Salvage */
		delta += getSalvageFossil(params) - getSalvageElectric(params);
		
		// TODO Battery cost
		
		return Math.round(delta);
	}
}

},{}],3:[function(require,module,exports){
var math = require("./math.js");

var jqWin = $(window);
function isScrolledIntoView(elem){
	var docViewTop = jqWin.scrollTop();
	var docViewBottom = docViewTop + jqWin.height();
	var elemTop = elem.offset().top;
	var elemBottom = elemTop + elem.height();
	return (elemBottom <= docViewBottom && elemBottom >= docViewTop) || 
		(elemTop <= docViewBottom && elemTop >= docViewTop);
}

/* Returns div bars for a specific graph area */
function getDivs(params){
	var totalColumns = params.data.length;
	var width = 100/totalColumns;
	
	var maxValue = -Infinity;
	params.data.forEach(function(o){
		if(o.val > maxValue) maxValue = o.val;
	});
	var multiplier = Math.abs(100/maxValue);
	
	return params.data.map(function(o, index){
		var isTerminal = index==0 || index==params.data.length-1;
		var heightPercent = Math.max(0, o.val*multiplier);
		
		return "<div style=\"width:"+width+"%;\" class=\"column\" data-id=\""+params.dataId+"\" range=\""+o.range+"\">\
			<div style=\"bottom:"+heightPercent+"%;\" class=\"column-value-display\" value=\""+o.val+"\">₹ <span>"+o.val+"</span></div>\
			"+(isTerminal ? "<div style=\"bottom:"+heightPercent+"%;\" class=\"column-value-display-terminal\" value=\""+o.val+"\">₹ <span>"+o.val+"</span></div>" : "")+"\
			<div style=\"height:"+heightPercent+"%;\" class=\"column-value\" value=\""+o.val+"\"></div>\
		</div>"
	});
}

/* Computes (x,y) coordinates to be plotted for a specific variate */
function getData(params){
	var minValue = parseFloat(params.input.attr('min'));
	var maxValue = parseFloat(params.input.attr('max'));
	var range = [];
	var sliderStep = parseFloat(params.input.attr('step'));
	var stepSize = (maxValue-minValue)/params.numSteps;
	for(var i=0; i<params.numSteps; i++){
		var x = (i*stepSize) + (stepSize/2) + minValue;
		var multiplier = Math.round(x/sliderStep);
		var roundX = sliderStep*multiplier;
		
		var variateBlock = {};
		variateBlock[params.variateKey] = roundX;
		
		range.push({
			range: roundX,
			val: math.getSavings(variateBlock)
		});
	}
	return range;
}

/* Sets the active bar (i.e. the one which includes the current input value) for a specific graph area */
function setActiveBar(dataId){
	var graph = $('.chart-container[data-id='+dataId+']');
	var bars = graph.children();
	if(bars.length){
		var input = $('input[type=range][data-id='+dataId+']');
		var maxValue = input.attr('max');
		var minValue = input.attr('min');
		var ratio = (input.val() - minValue) / (maxValue - minValue);
		var targetBarId = Math.min(Math.floor(ratio * bars.length), bars.length - 1);
	
		graph.find('.active').removeClass('active');
		graph.find('.adjacent').removeClass('adjacent');
		
		$(bars[targetBarId]).addClass('active');
		if(targetBarId>0) $(bars[targetBarId-1]).addClass('adjacent');
		if(targetBarId<bars.length-1) $(bars[targetBarId+1]).addClass('adjacent');
	}
}

/* Update the displayed input value corresponding to a slider */
function setValueDisplay(dataId){
	var input = $('input[type=range][data-id='+dataId+']');
	var valueDisplay = input.parent().children('.input-value-display');
	
	/* Set value */
	valueDisplay.children('span').text(input.val());	
	
	/* Set Position */
	var displayWidth = valueDisplay.outerWidth();
	var range = input.attr('max') - input.attr('min');
	var left = Math.round((input.parent().width() * (input.val() - input.attr('min'))/range) - displayWidth/2);
	valueDisplay.css('left', left + 'px');
}

var drawTimeOuts = {};
function drawGraph(params, delayed){
	var selfDataId = params.graph.attr('data-id');
	clearTimeout(drawTimeOuts[selfDataId]);
	/* Update only those graphs which are visible on screen */
	if(isScrolledIntoView(params.graph) || delayed){
		var numSteps = params.numSteps || 21;
		params.graph.html(getDivs({
			data: getData({
				numSteps: numSteps,
				input: params.targetInput,
				variateKey: params.targetInput.attr('variate-key')
			}),
			dataId: selfDataId
		}));
		setActiveBar(selfDataId);
	}
	/* Other graphs will be updated only after input change stabalizes */
	else{
		drawTimeOuts[selfDataId] = setTimeout(drawGraph, 1000, params, true);
	}
}

function drawGraphs(params){
	params = params || {};
	$('.chart-group-container').each(function(){
		var self = $(this);
		if(self.attr('data-id') != params.dataId && (!params.context || self.attr('context') == params.context)){
			drawGraph({
				graph: self.children('.chart-container'),
				targetInput: self.children('input[type=range]')
			});
		}
	});
}

$(document).ready(function(){	
	var dataIdSequence = 0;
	$('.graph-row').each(function(){
		var self = $(this);
		self.find('input, .chart-group-container, .chart-container, .input-value-display')
			.attr('data-id', dataIdSequence)
			.attr('context', self.attr('context'))
			.attr('variate-key', self.attr('variate-key'));
		dataIdSequence++;
	});
	
	$('.chart-group-container>input').each(function(){
		var self = $(this);	
		if(self.hasClass('coupled-input')){
			var inputs = $('.coupled-input[data-id='+self.attr('data-id')+']');
			inputs.attr('min', self.attr('min'));
			inputs.attr('max', self.attr('max'));
			inputs.attr('step', self.attr('step'));
		}
	});
	
	$('.chart-container').on('click', '.column', function() {
		var self = $(this);
		$('input[type=range][data-id='+self.attr('data-id')+']').val(self.attr('range')).change();
	});
	
	drawGraphs();
	
	var changeHandlerStateKey = "lastHandledValue";
	function changeHandler(elem){
		if(elem.val() != elem.attr(changeHandlerStateKey)){
			var dataId = elem.attr('data-id');
			$('.coupled-input[data-id='+(elem.attr('data-id'))+']').val(elem.val());
			$('.coupled-input[data-id='+(elem.attr('data-id'))+']').attr(changeHandlerStateKey, elem.val());
		
			var savings = math.getSavings();
			$('#net-savings span').text(savings);
			drawGraphs({
				dataId: dataId,
				context: elem.attr('context')
			});
			setActiveBar(dataId);
			setValueDisplay(dataId);
		
			$('.graph-row[context='+elem.attr('context')+'] .column.active .column-value-display span').text(savings);
		}
	}
	$(".coupled-input").change(function(){
		changeHandler($(this));
	});
	$(".coupled-input").on("input", function(){
		changeHandler($(this));
	});
	$(document).ready(function(){
		$('input[type=range]').each(function(){
			setValueDisplay($(this).attr('data-id'));
		});
	});
	
	$('#net-savings span').text(math.getSavings());
	
	/* Constraint setting */
	$("input[type=range][variate-key=VDU]").change(function(){
		var newValue = $(this).val();
		var loanTenureInput = $("input[variate-key=FLT]");
		loanTenureInput.attr('max', newValue);
		loanTenureInput.val(Math.min(loanTenureInput.val(), newValue)).change();
	});
});

},{"./math.js":2}]},{},[1]);
