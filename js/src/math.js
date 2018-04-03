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

function getEmi(params, vehicleType){
	principle = (vehicleType == 'e' ? params.VCOE : params.VCOF) * (1-(params.FPE/100));
	interest = params.FLR / 1200;
	var months = params.FLT * 12;
	var powerVal = Math.pow(1+interest, months);
	return (principle * interest * powerVal)/(powerVal - 1);
}

function getPviElectric(params, i){
	var reeBlock = Math.pow(1+(params.REE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	return params.DR * params.DRD * ((params.VM * params.RER * reeBlock) + ((params.MEC + params.MEO) * fifBlock));
}

function getSalvageElectric(params){
	return params.VCOE * Math.pow(1 - (params.FDE/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

function getPviFossil(params, i){
	var rfeBlock = Math.pow(1+(params.RFE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	return params.DR * params.DRD * ((params.RFR * rfeBlock / params.VDM) + ((params.MFC + params.MFO) * fifBlock));
}

function getSalvageFossil(params){
	return params.VCOF * Math.pow(1 - (params.FDD/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU);
}

module.exports = {
	getAnswers: function(params){
		params = params || {};
		Object.keys(variables).forEach(function(varName){
			params[varName] = parseFloat(issetOrElse(params[varName], variables[varName].val())) * (parseInt(variables[varName].attr('scale')) || 1);
		});
		
		var monthlyKm = params.DR * params.DRD;
		var availableBatteryLife = params.VBL;

		var evDownPayment = params.VCOE * params.FPE/100;
		var evEmi = getEmi(params, "e");
		
		var fossilDownPayment = params.VCOF * params.FPE/100;
		var fossilEmi = getEmi(params, "f");

		var emiMonths = params.FLT*12;

		var evCost = evDownPayment;
		var fossilCost = fossilDownPayment;
		var batteryReplaceMentCost = 0;
		var batteryMonths = [];
		
		var payback = -1;
		
		for(var i=1; i<=params.VDU*12; i++){
			var friBlock = Math.pow(1+(params.FRI/1200), i);
		
			evCost += getPviElectric(params, i) / friBlock;
			fossilCost += getPviFossil(params, i) / friBlock;
			
			if(i <= emiMonths){
				evCost += evEmi / friBlock;
				fossilCost += fossilEmi / friBlock;
			}
			
			if(availableBatteryLife <= 0){
				var batteryEffect = params.VBCO * Math.pow(1-(params.FBR/1200), i) / friBlock;
				
				batteryReplaceMentCost += batteryEffect;
				evCost += batteryEffect;
				
				availableBatteryLife = params.VBL;
				batteryMonths.push(i);
			}
			availableBatteryLife -= monthlyKm;
			
			if(evCost <= fossilCost && payback == -1){
				payback = i;
			}
			else if(evCost > fossilCost){
				payback = -1;
			}
		}
		
		/* Salvage */
		var evSalvage = getSalvageElectric(params);
		var fossilSalvage = getSalvageFossil(params);;
		evCost -= evSalvage;
		fossilCost -= fossilSalvage;
		
		return {
			emiMonths,
			_s: "",
			evCost,
			evDownPayment,
			evEmi,
			batteryMonths,
			batteryReplaceMentCost,
			evSalvage,
			__s: "",
			fossilCost,
			fossilDownPayment,
			fossilEmi,
			fossilSalvage,
			___s: "",
			savings: Math.round(fossilCost - evCost),
			payback
		};
	}
}
