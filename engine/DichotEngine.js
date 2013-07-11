


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

		Calibrations[ _question.ID ] = _question;
	}

	return Calibrations;

}

function calculateItemValues(calibrations, ability, properties){

	var propCorrect =  properties[3].DefaultTargetProbabilityCorrect;
	var NoiseRange = properties[14].NoiseRange;
	var ThetaTarget;

	ThetaTarget = ability - Math.log(propCorrect / (1 - propCorrect));
    ThetaTarget = ThetaTarget + Math.random() * 2 * NoiseRange - NoiseRange;


	for (var question in calibrations)
	{
		calibrations[question].Vari = Math.abs(calibrations[question].A_GRM - ThetaTarget);
	}

}


function getNextItem(calibrations){

	var lowestVariance = 99.0;
	var nextQuestion = "";

	for (var question in calibrations)
	{
		if( calibrations[question].Vari < lowestVariance && calibrations[question].Administered == false){
			lowestVariance = calibrations[question].Vari;
			nextQuestion = question;
		}
	}
 
	return nextQuestion;
}




function engine(_calibration, startAbility){


	this.calibration = _calibration;
	this.responses = new Array();
	this.ability = startAbility;
	this.StandardError = 9.900;
	this.ID ="";

	this.Calibrations = new Object();
	
	this.finished = false;
	
	this.init = function(){

		this.Calibrations = loadParameters(this.calibration.Items);
		this.display();
	}
	
	this.displayResults = function(){
		var trace = "";

		for(var i=0 ; i <  this.responses.length; i++){
			trace = trace + this.responses[i].ID + "&#9;" + this.responses[i].Response + "&#9;" + parseFloat(this.responses[i].Ability *100)/100.0 + "&#9;" + parseFloat(this.responses[i].SE *100)/100.0 + "\r\n";
		}

		//this.responses = new Array();
		return trace;
	}


	this.estimateTheta = function(obj){
	
	
		var ThetaEst = this.ability;
		var iteration = 0;
		var converged = false;

		var _MaxNumIterations =this.calibration.Properties[7].MaxNumIterations;
		var _Convergence = this.calibration.Properties[0].Convergence;
		var _MaxStepChange = this.calibration.Properties[9].MaxStepChange;
		var _MaxTheta = this.calibration.Properties[10].MaxTheta;
		var _MinTheta = this.calibration.Properties[13].MinTheta;
		
		var info;
		var change;
		var SumScore;
		var SumProbability;
		var Probability;
		var ItemIndex;
		var ResponseIndex;

		this.responses[this.responses.length] = new Results(this.ID, obj, this.ability, this.StandardError );

		/* check end conditions */
		var _CorrectAnswers = 0;
		for(var i=0; i < this.responses.length; i++){
			if(this.responses[i].Response == '1'){
				_CorrectAnswers = _CorrectAnswers + 1;
			}
		}
		
		if(_CorrectAnswers == 0){
			this.ability = parseFloat(this.ability) - parseFloat(_MaxStepChange);

			if(this.ability < _MinTheta){
				this.ability = _MinTheta;
			}

			this.Calibrations[this.ID].Administered = true;
			this.responses[this.responses.length -1].Ability = this.ability;
			this.responses[this.responses.length -1].SE = this.StandardError ;
			return this.ability;
		}
		
		if(_CorrectAnswers == this.responses.length){
			this.ability = parseFloat(this.ability) + parseFloat(_MaxStepChange);
			if(this.ability > _MaxTheta){
				this.ability = _MaxTheta;
			}
			this.Calibrations[this.ID].Administered = true;
			this.responses[this.responses.length -1].Ability = this.ability;
			this.responses[this.responses.length -1].SE = this.StandardError ;
			return this.ability;
		}
		/* check end conditions */


		do {

			SumScore = 0.0;
			SumProbability = 0.0;
			info = 0.0;
			for (var i = 0; i < this.responses.length; i++) {
				ItemIndex =   this.responses[i].ID;
				ResponseIndex = this.responses[i].Response;
				Probability = 1 / (1 + Math.exp((-1) * (ThetaEst - this.Calibrations[ItemIndex].A_GRM )));  
				info = info + Probability * (1 - Probability);
				SumScore = SumScore + ResponseIndex;
				SumProbability = SumProbability + Probability;
			}
			change = (SumScore - SumProbability) / ((-1) * info);
			if (Math.abs(change) <= _Convergence) {
				converged = true;
			}
			if (Math.abs(change) > _MaxStepChange) {
				change = (change >= 0) ? _MaxStepChange : ((-1) * _MaxStepChange);
			}
			ThetaEst = ThetaEst - change;
			iteration++;
			
			
		} while ((iteration <= _MaxNumIterations) && (!converged));
		
		if (Math.abs(ThetaEst - this.ability) > _MaxStepChange) {
			var sign = (ThetaEst - this.ability < 0) ? -1 : 1;
			this.ability = this.ability + sign * _MaxStepChange;
		}
		else {
			this.ability = ThetaEst;
			this.StandardError =  1 / Math.sqrt(info);
		}

		this.Calibrations[this.ID].Administered = true;
		this.responses[this.responses.length -1].Ability = this.ability;
		this.responses[this.responses.length -1].SE = this.StandardError ;

		return this.ability;

	}

	this.next = function(){
		this.display();
	}

	this.display = function(){
		
		calculateItemValues(this.Calibrations, this.ability, this.calibration.Properties);
		var nextItem = getNextItem(this.Calibrations);
		this.ID = nextItem;
		return nextItem;
	}

	this.processResponse = function( response ){

		this.ability =  this.estimateTheta(response);
		var _MaxNumItems = this.calibration.Properties[6].MaxNumItems -1;
		var _MaxStdErr = this.calibration.Properties[8].MaxStdErr;
		var _MinNumItems = this.calibration.Properties[11].MinNumItems -1;

		if( (this.responses[this.responses.length-1].SE < _MaxStdErr && this.responses.length > _MinNumItems) || this.responses.length > _MaxNumItems ){
				this.finished = true;
		}

	}
	
}