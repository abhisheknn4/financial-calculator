(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
require("./sliders.js");

if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').catch(function(err) {console.err("Error registering service worker", err);});
}

},{"./sliders.js":2}],2:[function(require,module,exports){
var changeHandlerStateKey = "lastHandledValue";

function isset(val){
	return typeof val != 'undefined';
}

function getEmi(params){
	params = params || {};
	var principle = isset(params.principle) ? params.principle : $('#input-principle').val();
	var interest = (isset(params.interest)? params.interest : $('#input-interest-rate').val()) / 1200;
	var months = (isset(params.years) ? params.years : $('#input-years').val()) * 12;
	
	var powerVal = Math.pow(1+interest, months);
	return Math.round((principle * interest * powerVal)/(powerVal - 1)*100)/100;
}

function changeHandler(elem){
	if(elem.val() != elem.attr(changeHandlerStateKey)){
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').val(elem.val());
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').attr(changeHandlerStateKey, elem.val());
		var emi = getEmi();
		$('#calculated-emi').text(emi);
		drawGraphs();
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
		changeHandler($(this));
	});
});

/***********Charts*************/

function getDivs(params){
	var totalColumns = params.data.length;
	var width = 100/totalColumns;
	
	var maxValue = -Infinity;
	params.data.forEach(function(o){
		if(o.val > maxValue) maxValue = o.val;
	});
	var multiplier = 100/maxValue;
	
	return params.data.map(function(o){
		return "<div style=\"width:"+width+"%;\" class=\"column\" range=\""+o.range+"\">\
			<div style=\"height:"+(100 - (o.val*multiplier))+"%;\" class=\"column-value\" value=\""+o.val+"\"></div>\
		</div>"
	});
}

function getData(params){
	var minValue = params.input.attr('min');
	var maxValue = params.input.attr('max');
	var range = [];
	var sliderStep = parseFloat(params.input.attr('step'));
	var stepSize = (maxValue-minValue)/params.numSteps;
	for(var i=0; i<params.numSteps; i++){
		var x = (i*stepSize) + (stepSize/2);
		var multiplier = Math.round(x/sliderStep);
		var roundX = sliderStep*multiplier;
		
		var variateBlock = {};
		variateBlock[params.variateKey] = roundX;
		
		range.push({
			range: roundX,
			val: getEmi(variateBlock)
		});
	}
	return range;
}

function drawGraphs(){
	$('#variance-years').html(getDivs({
		data: getData({
			numSteps: 40,
			input: $('#input-years'),
			variateKey: 'years'
		})
	}));
	
	$('#variance-principle').html(getDivs({
		data: getData({
			numSteps: 40,
			input: $('#input-principle'),
			variateKey: 'principle'
		})
	}));
	
	$('#variance-interest-rate').html(getDivs({
		data: getData({
			numSteps: 40,
			input: $('#input-interest-rate'),
			variateKey: 'interest'
		})
	}));
}

$(document).ready(function(){
	drawGraphs();
});

},{}]},{},[1]);
