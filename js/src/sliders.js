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
