NCS
===

Verbal Recognition

  ################################################
  ##  Toolbox Picture Vocab – vocab/index.html  ##
  ################################################

  TB Vocab is a bundle of 6 instruments.  The bundle should be administered in the following order:

		1. Education Instrument:  If the participant is an adult, this instrument will set the initialized theta that the dichotomous engine will use.  If the participant is under 18, the screener age question will set the initialized theta.
		2. NIH TB Picture Vocabulary Test – Title Instrument:  Title page.
		3. NIH TB Picture Vocabulary Test – Instruction Instrument:  Will give participant instructions on how to take the test.  This instrument is branched by age.
		4. NIH TB Picture Vocabulary Test – Practice Instrument:  Will present participant with two practice items that will not be scored.  Participant must answer each item correctly to move on.
		5. NIH TB Picture Vocabulary Test – Intro Instrument:  Will give participant an introduction before administering the main dichotomous instrument.  This instrument is branched by age.
		6. NIH TB Picture Vocabulary Test Instrument:  The graded dichotomous test.

	Please use vocab/index.html to administer instruments in the proper order.


  ###########################################################
  ##  Additional GRM Instrument Data Files for GRM Engine  ##
  ###########################################################

	In the root folder you will find the following two PROMIS instrument data files:
	
		dataPROMISEmotionalSupport.js
		dataPROMISDepression.js
	
	These are to be used with GRMEngine.js  given in the last harness release.  Swap these files with data.js and the instruments will provision automatically using the harness. 


  #######################
  ##  Note on Engines  ##
  #######################

	To date you should have 3 engines:

		GRMEngine.js
		DichotEngine.js
		SequenceEngine.js

	Each of these engines handles calibrations differently.  GRM requires a mapped format, whereas the dichotomous does not.  The sequence engine does not require calibrations at all and will not do any scoring. 


  ##################################################################
  ## The format for the dichotomous calibrations is listed below: ##
  ##################################################################
	{
		"FormOID":"65EB2645-33C9-405F-836E-6A0DFCEC45FE", // AssessmentCenter Form Identifier
		"Form":"N_LAVOC",	// Form Name			

		"Properties":[  // Test level parameters

			{"Convergence":"0.005"},
			{"DefaultBin":"12"},		// N/A for dichotomous
			{"DefaultStartingTheta":"0"},
			{"DefaultTargetProbabilityCorrect":"0.5"},
			{"IRTModel":"2"},		// Assessment Center enumerator
			{"LogisticScaling":"1"},
			{"MaxNumItems":"30"},
			{"MaxNumIterations":"30"},
			{"MaxStdErr":"0.5"},
			{"MaxStepChange":"1"},
			{"MaxTheta":"99"},
			{"MinNumItems":"20"},
			{"MinNumStradaptive":"5"},
			{"MinTheta":"-99"},
			{"NoiseRange":"0.0"},
			{"SelectionGroupSize":"1"},
			{"SelectionMethod":"3"},
			{"StdErrNonML":"9.9"},
			{"ThetaIncrement":"0.1"}
		]

		,"Items":[  

			// Item level parameters
			// FormITemOID -  AssessmentCenter Form/Item Identifier
			// ID - Item Identifier
			// A_GRM - Item Difficulty value  

			{"FormItemOID":"0007965D-84F2-48D0-BA3B-B43DBFDD1716","ID":"LAVOC560","A_GRM":"5.06"}, 
			{"FormItemOID":"0027876A-E250-482A-B819-424E46CED3A4","ID":"LAVOC316","A_GRM":"0.22"},	 
			{"FormItemOID":"00D596FD-2D0B-4016-873C-BB67AF137F35","ID":"LAVOC455","A_GRM":"-0.58"}
			...
		]
