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
