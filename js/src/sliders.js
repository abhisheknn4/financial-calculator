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
		var dataId = elem.attr('data-id');
		
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').val(elem.val());
		$('.coupled-input[data-id='+(elem.attr('data-id'))+']').attr(changeHandlerStateKey, elem.val());
		var emi = getEmi();
		$('#calculated-emi').text(emi);
		drawGraphs(dataId);
		setActiveBar({
			dataId: dataId
		});
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
			<div style=\"height:"+(o.val*multiplier)+"%;\" class=\"column-value\" value=\""+o.val+"\"></div>\
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

function setActiveBar(params){
	var graph = $('.chart-container[data-id='+params.dataId+']');
	var bars = graph.children();
	if(bars.length){
		var input = $('input[type=range][data-id='+params.dataId+']');
		var maxValue = input.attr('max');
		var minValue = input.attr('min');
		var ratio = (input.val() - minValue) / (maxValue - minValue);
		var targetBarId = Math.min(Math.floor(ratio * bars.length), bars.length - 1);
	
		$('.chart-container[data-id='+params.dataId+'] .active').removeClass('active');
		$(bars[targetBarId]).addClass('active');
	}
}

function drawGraph(params){
	if(params.graph.attr('data-id') != params.changedInputDataId){
		var numSteps = params.numSteps || 40;
		params.graph.html(getDivs({
			data: getData({
				numSteps: numSteps,
				input: params.targetInput,
				variateKey: params.variateKey
			})
		}));
		setActiveBar({
			dataId: params.graph.attr('data-id')
		});
	}
}

function drawGraphs(dataId){
	drawGraph({
		graph: $('#variance-years'),
		changedInputDataId: dataId,
		targetInput: $('#input-years'),
		variateKey: 'years'
	});

	drawGraph({
		graph: $('#variance-principle'),
		changedInputDataId: dataId,
		targetInput: $('#input-principle'),
		variateKey: 'principle'
	});
	
	drawGraph({
		graph: $('#variance-interest-rate'),
		changedInputDataId: dataId,
		targetInput: $('#input-interest-rate'),
		variateKey: 'interest'
	});
}

$(document).ready(function(){
	drawGraphs();
});
