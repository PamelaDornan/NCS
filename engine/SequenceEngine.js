function Results(id, response, ability, se){
	this.ID = id;
	this.Response = response;
	this.Ability = ability;
	this.SE = se;
}

function engine(){


	this.responses = new Array();
	this.position;
	this.ID ="";
	this.finished = false;
	
	this.init = function(){
		this.position = 0;
	}
	
	this.getPosition = function(){
		return this.position;
	}
	
	this.displayResults = function(){
		var trace = "";

		for(var i=0 ; i <  this.responses.length; i++){
			trace = trace + this.responses[i].ID + "&#9;" + this.responses[i].Response + "&#9;" + this.responses[i].Ability + "&#9;" + this.responses[i].SE + "\r\n";
			
		}

		this.responses = new Array();
		return trace;
	}
	
	this.next = function(){
		var next = this.position + 1;
		this.position = next;
		this.display();
	}

	this.display = function(){
		return null;
	}

	this.processResponse = function(FormItemOID,ItemResponseOID,ItemValue){
		if(this.position == items.Items.length-1){
				this.finished = true;
		}
		this.responses[this.responses.length] = new Results(items.Items[this.position].ID, ItemValue, "n/a", "n/a" );
	}
	
}