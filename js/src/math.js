function isset(val){
	return typeof val != 'undefined';
}

module.exports = {
	getEmi: function(params){
		params = params || {};
		var principle = isset(params.principle) ? params.principle : $('#input-principle').val();
		var interest = (isset(params.interest)? params.interest : $('#input-interest-rate').val()) / 1200;
		var months = (isset(params.years) ? params.years : $('#input-years').val()) * 12;
	
		var powerVal = Math.pow(1+interest, months);
		return Math.round((principle * interest * powerVal)/(powerVal - 1)*100)/100;
	}
}
