(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
require("./sliders.js");

if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').catch(function(err) {console.err("Error registering service worker", err);});
}

},{"./sliders.js":2}],2:[function(require,module,exports){
var changeHandlerStateKey = "lastHandledValue";

function getEmi(){
	var principle = $('#input-principle').val();
	console.log("principle: " + principle);
	var interest = $('#input-interest-rate').val() / 1200;
	console.log("interest: " + interest);
	var months = $('#input-years').val() * 12;
	console.log("years: " + $('#input-years').val());
	console.log("months: " + months);
	
	var powerVal = Math.pow(1+interest, months);
	return Math.round((principle * interest * powerVal)/(powerVal - 1)*100)/100;
}

function changeHandler(elem){
	if(elem.val() != elem.attr(changeHandlerStateKey)){
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').val(elem.val());
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').attr(changeHandlerStateKey, elem.val());
		var emi = getEmi();
		$('#calculated-emi').text(emi);
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

},{}]},{},[1]);
