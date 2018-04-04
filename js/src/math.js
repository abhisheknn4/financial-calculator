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
	if(interest == 0) return principle/months;
	var powerVal = Math.pow(1+interest, months);
	return (principle * interest * powerVal)/(powerVal - 1);
}

function getPviElectric(params, i){
	var reeBlock = Math.pow(1+(params.REE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	return params.DR * params.DRD * ((params.VM * params.RER * reeBlock) + ((params.MEC + params.MEO) * fifBlock));
}

function getPviFossil(params, i){
	var rfeBlock = Math.pow(1+(params.RFE/1200), i);
	var fifBlock = Math.pow(1+(params.FIF/1200), i);
	return params.DR * params.DRD * ((params.RFR * rfeBlock / params.VDM) + ((params.MFC + params.MFO) * fifBlock));
}

function getSalvage(params, vehicleType){
	var vehicleCost = vehicleType == 'e' ? params.VCOE : params.VCOF;
	var depreciationRate = vehicleType == 'e' ? params.FDE : params.FDD;
	
	return vehicleCost * Math.pow(1 - (depreciationRate/100), params.VDU) / Math.pow(1 + (params.FRI/1200), params.VDU*12 + 1);
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
		var evLoanAmount = params.VCOE - evDownPayment;
		var evEmi = getEmi(params, "e");
		
		var fossilDownPayment = params.VCOF * params.FPE/100;
		var fossilLoanAmount = params.VCOF - fossilDownPayment;
		var fossilEmi = getEmi(params, "f");

		var emiMonths = params.FLT*12;
		var usageMonths = params.VDU*12;

		var evNpv = evDownPayment;
		var fossilNpv = fossilDownPayment;
		var batteryReplaceMentCost = 0;
		var batteryMonths = [];
		
		var payback = -1;
		
		for(var i=1; i<=usageMonths; i++){
			var friBlock = Math.pow(1+(params.FRI/1200), i);
		
			evNpv += getPviElectric(params, i) / friBlock;
			fossilNpv += getPviFossil(params, i) / friBlock;
			
			if(i <= emiMonths){
				evNpv += evEmi / friBlock;
				fossilNpv += fossilEmi / friBlock;
			}
			
			if(availableBatteryLife <= 0){
				var batteryEffect = params.VBCO * Math.pow(1-(params.FBR/1200), i) / friBlock;
				
				batteryReplaceMentCost += batteryEffect;
				evNpv += batteryEffect;
				
				availableBatteryLife = params.VBL;
				batteryMonths.push(i);
			}
			availableBatteryLife -= monthlyKm;
			
			if(evNpv <= fossilNpv && payback == -1){
				payback = i;
			}
			else if(evNpv > fossilNpv){
				payback = -1;
			}
		}
		
		/* Salvage */
		var evSalvage = getSalvage(params, 'e');
		var fossilSalvage = getSalvage(params, 'f');
		evNpv -= evSalvage;
		fossilNpv -= fossilSalvage;
		
		/* Payback after salvage */
		if(evNpv <= fossilNpv && payback == -1){
			payback = usageMonths + 1;
		}
		
		return {
			emiMonths,
			_s: "",
			evNpv,
			evLoanAmount,
			evDownPayment,
			evEmi,
			batteryMonths,
			batteryReplaceMentCost,
			evSalvage,
			__s: "",
			fossilNpv,
			fossilLoanAmount,
			fossilDownPayment,
			fossilEmi,
			fossilSalvage,
			___s: "",
			savings: Math.round(fossilNpv - evNpv),
			payback
		};
	}
}
