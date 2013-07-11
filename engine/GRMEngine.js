


function Question(id, difficulty){

	this.ID = id;
	this.Vari;
	this.Administered = false;
	
	this.Calibration = new Array();
	this.Boundaries = new Array();
	
	this.Prob = new Array();
	this.ThresholdSum = new Array();
}

function Results(id, response, ability, se){
	//alert(id+" : "+response+" : "+ability+" : "+se)
	this.ID = id;
	this.Response = response;
	this.Ability = ability;
	this.SE = se;
}


function loadParameters(items){

	var Calibrations = new Object();

	for (i = 0; i < items.length; i++ )
	{
		var _question = new Question();
		    _question.ID = items[i].ID;
		    _question.A_GRM = items[i].A_GRM;
	
		for (j = 0; j < items[i].Map.length; j++ )
		{
			_question.Calibration[j] = items[i].Map[j].StepOrder;
			_question.Boundaries[j] = items[i].Map[j].Threshold;

		}
		Calibrations[ _question.ID ] = _question;
	}

	return Calibrations;

}

function SetNormalDistribution(_array)
{

	var Mean = 0.0;
	var StdDev = 1.0;
	var tmp = 1.0;
	var distArray = new Array();
	for (var i = 0; i < _array.length; i++) {
		tmp = (_array[i] - Mean) / StdDev;
		distArray[i] = 1 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * tmp * tmp);
	}
	
	return distArray;
}

function calibrate(abilityRange, calibrations, matrix){


	for (var i =0 ; i < abilityRange.length; i++){
	
		calculateProb(abilityRange[i], calibrations);
		calculateVari(abilityRange[i], calibrations);
	
		var QuestionVariance = new Array();
	
		for (var question in calibrations)
		{
			QuestionVariance[question] = calibrations[question].Vari; 
		}
		matrix[abilityRange[i]] = QuestionVariance;
	}


}

function calculateVari(ability, calibrations){

	var runningTotal = 0.0;
	for (var question in calibrations)
	{
	  runningTotal  = 0.0;
	  calibrations[question].Vari = 0.0 ;
	  
	  for ( var i=0; i <calibrations[question].Calibration.length + 1 ; i++){
      var x =  calibrations[question].ThresholdSum[i] * (1- calibrations[question].ThresholdSum[i] );
	  var xi = calibrations[question].ThresholdSum[i +1] * (1- calibrations[question].ThresholdSum[i + 1] );  
		runningTotal = runningTotal + Math.pow(calibrations[question].A_GRM *(x - xi),2)/ calibrations[question].Prob[i];
 	  }
	  
	  calibrations[question].Vari = runningTotal ;
	}

}

function calculateProb(ability, calibrations){

	for (var question in calibrations)
	{
 
	  for ( var i=0; i <calibrations[question].Calibration.length ; i++){ 

		calibrations[question].Prob[i] = 1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (ability - calibrations[question].Boundaries[i]) ));

		if( i == 0){
			probability = 1.0; 
		}else{
			probability =  1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (ability - calibrations[question].Boundaries[i-1]) ));
		}
		calibrations[question].Prob[i] =  probability  -  calibrations[question].Prob[i] ;
		calibrations[question].ThresholdSum[i] = probability;
	  }
	  
	  calibrations[question].Prob[calibrations[question].Calibration.length] =  1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (ability - calibrations[question].Boundaries[calibrations[question].Calibration.length-1]) ));

	  calibrations[question].ThresholdSum[calibrations[question].Calibration.length] = calibrations[question].Prob[calibrations[question].Calibration.length];
	  calibrations[question].ThresholdSum[calibrations[question].Calibration.length + 1] = 0.0;

	}
	
}

function calculateItemResponseProb(question,response,calibrations,abilityRange){

	var probItemResponse = new Array();


	for (var k=0; k < abilityRange.length;k++)
	{
		if( (response-1) == calibrations[question].Boundaries.length ){//boundary condition
			probItemResponse[k] =   1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (abilityRange[k] - calibrations[question].Boundaries[calibrations[question].Calibration.length-1]) ));
		}else{
			probItemResponse[k] = 1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (abilityRange[k] - calibrations[question].Boundaries[response-1]) ));
		}

		if( (response-1) == 0){
			probability = 1.0; 
		}else{
			probability =  1.0 / ( 1.0 + Math.exp( -1.0 *  calibrations[question].A_GRM * (abilityRange[k] - calibrations[question].Boundaries[response-2]) ));
		}
		
		if( (response-1) != calibrations[question].Boundaries.length ){
			probItemResponse[k] =  probability  -  probItemResponse[k] ;
		}
	}
	
	return probItemResponse;
}

function getNextItem(calibrations, matrix, abilities, Likelyhood){

	var highestVariance = 0.0;
	var abilityLikelyHood = 0.0;
	var nextQuestion = "";

	var LikelyhoodWeighting = new Object();
	
	for (var question in calibrations)
	{
		LikelyhoodWeighting[question]  = 0.0;
	}

	for( var i=0; i < abilities.length; i++){
	
		var QuestionVariance = matrix[abilities[i]];

		abilityLikelyHood = Likelyhood[i];
		
		for (var question in calibrations)
		{
			LikelyhoodWeighting[question] = LikelyhoodWeighting[question] + QuestionVariance[question] * abilityLikelyHood;
		}
	}
	
	for (var question in calibrations)
	{
		if(LikelyhoodWeighting[question] > highestVariance && calibrations[question].Administered == false){
			highestVariance = LikelyhoodWeighting[question];
			nextQuestion = question;
		}
		
	}

	return nextQuestion;
}




function engine(_calibration){


	this.calibration = _calibration;

	this.itemstore = new Array();
	this.responses = new Array();
	this.position = 0;
	this.ability = 0.0;
	this.ability_min = -4.0;
	this.ability_max = 4.0;
	
	this.item_max = 12;
	this.item_min = 4;
	
	this.StandardError = 0.0;
	this.ID ="";

	this.Matrix = new Object();
	this.AbilityRange = new Array();
	this.LikelyHood = new Array();
	this.LikelyHoodEstimate = new Array();
	this.Calibrations = new Object();
	
	this.finished = false;
	
	this.init = function(){
	
		this.setAbilityRange();
		this.LikelyHood = SetNormalDistribution(this.AbilityRange);
		this.LikelyHoodEstimate = SetNormalDistribution(this.AbilityRange);

		this.Calibrations = loadParameters(this.calibration.Items);
		calibrate(this.AbilityRange, this.Calibrations, this.Matrix);
		
		this.display();
	}
	
	this.displayResults = function(){
		var trace = "";

		for(var i=0 ; i <  this.responses.length; i++){
			//alert(this.responses[i].ID+" : "+this.responses[i].Response+" : "+this.responses[i].Ability+" : "+this.responses[i].SE);
			trace = trace + this.responses[i].ID + "&#9;" + this.responses[i].Response + "&#9;" + parseFloat(this.responses[i].Ability *100)/100.0000 + "&#9;" + parseFloat(this.responses[i].SE *100)/100.0000 + "\r\n";
			//alert(trace);
		}

		this.responses = new Array();
		return trace;
	}


	this.estimateTheta = function(obj){

		QAProbability = calculateItemResponseProb(this.ID, obj, this.Calibrations,this.AbilityRange);

		var calculatedAbilityNumerator = 0.00;
		var calculatedAbilityDenomenator = 0.00;
		var calculatedErrorNumerator = 0.00;
		var EAP = new Array();
		for(var j=0; j < QAProbability.length; j++){
			this.LikelyHood[j] = this.LikelyHood[j] *  QAProbability[j];
			this.LikelyHoodEstimate[j] = this.LikelyHoodEstimate[j] *  QAProbability[j];
			calculatedAbilityNumerator = calculatedAbilityNumerator + (this.AbilityRange[j]  * this.LikelyHoodEstimate[j]);
			calculatedAbilityDenomenator = calculatedAbilityDenomenator + this.LikelyHoodEstimate[j];
		}
		this.ability = calculatedAbilityNumerator/calculatedAbilityDenomenator;
		
		
		for(var k=0; k < this.AbilityRange.length; k++){
			EAP[k] = Math.pow( (this.AbilityRange[k] - this.ability) ,2);
			EAP[k] =  EAP[k] * this.LikelyHoodEstimate[k] ;
			calculatedErrorNumerator = calculatedErrorNumerator + EAP[k];
		}
		this.StandardError = Math.sqrt(calculatedErrorNumerator/calculatedAbilityDenomenator);
		this.Calibrations[this.ID].Administered = true;
		this.responses[this.responses.length] = new Results(this.ID, obj, this.ability, this.StandardError );
	
		return this.ability;
	
	}


	
	this.setAbilityRange = function(){
		//"TODO:read properties from  this.calibration.Properties";
		for(var i = 0; i < parseInt(10* (this.ability_max - this.ability_min)) + 1; i++){
			this.AbilityRange[i] = this.ability_min + (.1 * i);
		}
	}
	
	this.next = function(){
		this.display();
	}

	this.display = function(){

		var nextItem = getNextItem(this.Calibrations, this.Matrix,this.AbilityRange,this.LikelyHood);
		this.ID = nextItem;
		return nextItem;
	}

	this.processResponse = function(FormItemOID,ItemResponseOID){

		var response;

		for(var i=0; i < this.calibration.Items.length; i++){
			if(FormItemOID == this.calibration.Items[i].FormItemOID){
			
				for(j=0; j < this.calibration.Items[i].Map.length; j++){
					if(ItemResponseOID == this.calibration.Items[i].Map[j].ItemResponseOID ){
						response = parseInt(this.calibration.Items[i].Map[j].StepOrder);
						break;
					}
				}
				
				if(typeof(response)  == 'undefined' ){ // boundary condition
					response = this.calibration.Items[i].Map.length + 1;
				}
				
			}
		}
		this.ability =  this.estimateTheta(response);
		//"TODO:read properties from  this.calibration.Properties";
		if( (this.responses[this.responses.length-1].SE < .3 && this.responses.length > 3) || this.responses.length > 11 ){
				this.finished = true;
		}

	}
	
}