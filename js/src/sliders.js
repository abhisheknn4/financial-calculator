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
		
		return "<div style=\"width:"+width+"%;\" class=\"column\" data-id=\""+params.dataId+"\" range=\""+o.range+"\">"+
			"<div style=\"bottom:"+heightPercent+"%;\" class=\"column-value-display\" value=\""+o.val+"\">₹ <span>"+o.val+"</span></div>"+
			(isTerminal ? "<div style=\"bottom:"+heightPercent+"%;\" class=\"column-value-display-terminal\" value=\""+o.val+"\">₹ <span>"+o.val+"</span></div>" : "")+
			"<div style=\"height:"+heightPercent+"%;\" class=\"column-value\" value=\""+o.val+"\"></div>"+
		"</div>"
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
