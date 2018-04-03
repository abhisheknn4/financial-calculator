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
	'VBL', // Battery life
	'VBCO', // Current battery cost
	
	/* Fossil */
	'VCOF', // Vehicle cost (fossil)
	'VDM', // Vehicle mileage
	'RFR', // Diesel price
	'RFE', // Diesel price escalation rate
	'MFC', // Maintenance cost
	'MFO', // Other operational cost
	'FDD', // Depreciation rate
]

var variables = {};
$(document).ready(function(){
	variableList.forEach(function(varName){
		variables[varName] = $('.graph-row[variate-key='+varName+'] input[type=range]');
	});
});

function getEmi(params, vehicleType, numMonth){
	if(numMonth > params.FLT*12) return 0;
	principle = (vehicleType == 'e' ? params.VCOE : params.VCOF) * (1-(params.FPE/100));
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
	return params.VCOE * Math.pow(1 - (params.FDE/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

function getPviFossil(params, i){
	var emi = getEmi(params, 'f', i);
	var rfeBlock = Math.pow(1+(params.RFE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	var friBlock = Math.pow(1+(params.FRI/1200), i);
	return ((params.DR * params.DRD * ((params.RFR * rfeBlock / params.VDM) + ((params.MFC + params.MFO) * fifBlock))) + emi) / friBlock;
}

function getSalvageFossil(params){
	return params.VCOF * Math.pow(1 - (params.FDD/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

function getBatteryReplacementCost(params, i){
	var friBlock = Math.pow(1+(params.FRI/1200), i);
	var fbrBlock = Math.pow(1-(params.FBR/1200), i);
	return params.VBCO * fbrBlock / friBlock;
}

module.exports = {
	getAnswers: function(params){
		params = params || {};
		Object.keys(variables).forEach(function(varName){
			params[varName] = parseFloat(issetOrElse(params[varName], variables[varName].val())) * (parseInt(variables[varName].attr('scale')) || 1);
		});
		
		var monthlyKm = params.DR * params.DRD;
		var availableBatteryLife = params.VBL;

		var evCost = params.VCOE * params.FPE/100;
		var fossilCost = params.VCOF * params.FPE/100;
		var batteryReplaceMentCost = 0;
		
		for(var i=1; i<=params.VDU*12; i++){
			evCost += getPviElectric(params, i);
			fossilCost += getPviFossil(params, i);
			if(availableBatteryLife <= 0){
				batteryReplaceMentCost += getBatteryReplacementCost(params, i);
				availableBatteryLife = params.VBL;
			}
			availableBatteryLife -= monthlyKm;
		}
		
		/* Salvage */
		var salvageEv = getSalvageElectric(params);
		var salvageFossil = getSalvageFossil(params);;
		evCost -= salvageEv;
		fossilCost -= salvageFossil;
		
		evCost += batteryReplaceMentCost;
		
		return {
			evCost: Math.round(evCost),
			evSalvage: Math.round(salvageEv),
			batteryReplaceMentCost: Math.round(batteryReplaceMentCost),
			fossilCost: Math.round(fossilCost),
			fossilSalvage: Math.round(salvageFossil),
			savings: Math.round(fossilCost - evCost)
		};
	}
}
