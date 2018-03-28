(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
require("./sliders.js");

if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').catch(function(err) {console.err("Error registering service worker", err);});
}

},{"./sliders.js":3}],2:[function(require,module,exports){
function isset(val){
	return typeof val != 'undefined';
}

module.exports = {
	getEmi: function(params){
		params = params || {};
		var principle = isset(params.principle) ? params.principle : $('#input-principle').val();
		var interest = (isset(params.interest)? params.interest : $('#input-interest-rate').val()) / 1200;
		var months = (isset(params.years) ? params.years : $('#input-years').val()) * 12;
	
		var powerVal = Math.pow(1+interest, months);
		return Math.round((principle * interest * powerVal)/(powerVal - 1)*100)/100;
	}
}

},{}],3:[function(require,module,exports){
var math = require("./math.js");

var changeHandlerStateKey = "lastHandledValue";

function isScrolledIntoView(elem){
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();

	var elemTop = elem.offset().top;
	var elemBottom = elemTop + elem.height();

	return (elemBottom <= docViewBottom && elemBottom >= docViewTop) || 
		(elemTop <= docViewBottom && elemTop >= docViewTop);
}

function changeHandler(elem){
	if(elem.val() != elem.attr(changeHandlerStateKey)){
		var dataId = elem.attr('data-id');
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').val(elem.val());
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').attr(changeHandlerStateKey, elem.val());
		
		var emi = math.getEmi();
		$('#calculated-emi').text(emi);
		drawGraphs(dataId);
		setActiveBar(dataId);
		setValueDisplay(dataId);
		
		$('.column-value-display').each(function(){
			var t = $(this);
			t.text("₹ " + t.attr('value'));
		});
		$('.column.active .column-value-display').text("₹ " + emi);
	}
}

/***********Charts*************/

function getDivs(params){
	var totalColumns = params.data.length;
	var width = 100/totalColumns;
	
	var maxValue = -Infinity;
	params.data.forEach(function(o){
		if(o.val > maxValue) maxValue = o.val;
	});
	var multiplier = 100/maxValue;
	
	return params.data.map(function(o, index){
		return "<div style=\"width:"+width+"%;\" class=\"column\" data-id=\""+params.dataId+"\" range=\""+o.range+"\">\
			<div style=\"bottom:"+(o.val*multiplier)+"%;\" class=\"column-value-display "+((index==0 || index==params.data.length-1) ? "column-value-display-terminal" : "")+"\" value=\""+o.val+"\">₹ "+o.val+"</div>\
			<div style=\"height:"+(o.val*multiplier)+"%;\" class=\"column-value\" value=\""+o.val+"\"></div>\
		</div>"
	});
}

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
			val: math.getEmi(variateBlock)
		});
	}
	return range;
}

function setActiveBar(dataId){
	var graph = $('.chart-container[data-id='+dataId+']');
	var bars = graph.children();
	if(bars.length){
		var input = $('input[type=range][data-id='+dataId+']');
		var maxValue = input.attr('max');
		var minValue = input.attr('min');
		var ratio = (input.val() - minValue) / (maxValue - minValue);
		var targetBarId = Math.min(Math.floor(ratio * bars.length), bars.length - 1);
	
		$('.chart-container[data-id='+dataId+'] .active').removeClass('active');
		$(bars[targetBarId]).addClass('active');
	}
}

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
				variateKey: params.variateKey
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

function drawGraphs(dataId, delayed){
	$('.chart-group-container').each(function(){
		var self = $(this);
		if(self.attr('data-id') != dataId){
			drawGraph({
				graph: self.children('.chart-container'),
				targetInput: self.children('input[type=range]'),
				variateKey: self.attr('variate-key'),
			});
		}
	});
}

$(document).ready(function(){	
	var dataIdSequence = 0;
	$('.graph-row').each(function(){
		var self = $(this);
		self.find('input, .chart-group-container, .chart-container, .input-value-display').attr('data-id', dataIdSequence);
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
});

},{"./math.js":2}]},{},[1]);
