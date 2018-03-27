var math = require("./math.js");

var changeHandlerStateKey = "lastHandledValue";

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
	
	return params.data.map(function(o, index){
		return "<div style=\"width:"+width+"%;\" class=\"column\" range=\""+o.range+"\">\
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

function drawGraph(params){
	if(params.graph.attr('data-id') != params.changedInputDataId){
		var numSteps = params.numSteps || 81;
		params.graph.html(getDivs({
			data: getData({
				numSteps: numSteps,
				input: params.targetInput,
				variateKey: params.variateKey
			})
		}));
		setActiveBar(params.graph.attr('data-id'));
	}
}

function drawGraphs(dataId){
	$('.chart-group-container').each(function(){
		var self = $(this);
		drawGraph({
			graph: self.children('.chart-container'),
			changedInputDataId: dataId,
			targetInput: self.children('input[type=range]'),
			variateKey: self.attr('variate-key')
		});
	});
}

$(document).ready(function(){
	drawGraphs();
	
	$('.chart-group-container>input').each(function(){
		var self = $(this);
		if(typeof self.attr('data-id') != 'undefined'){
			self.parent().children().each(function(){
				$(this).attr('data-id', self.attr('data-id'));
			});
		}
	});
});
