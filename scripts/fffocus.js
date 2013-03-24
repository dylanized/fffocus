// session config

	var colors = {
		off 		: '#ccc',
		on			: 'green',
		paused		: '#ccc',
		done		: 'orange'
	}
	
	if (store.get('color')) {
		colors.on = store.get('color');
	}
	
	var default_settings = {
		duration	: 25,	// in minutes
		task		: "what are you doing?"
	} 
	
// define timer

	// constructor func
    Timer = function(id) {
    	    
		if (store.get(id)) {
			// resume from local store
			var store_obj = store.get(id);	    	
	    	this.status = store_obj.status;
 			this.durationMS = store_obj.durationMS;
 			var task = store_obj.task; 			
    		// if it was running, subtract elabsed time
	    	if (this.status == 'on') {
	    		var elapsed_time = Date.now() - store_obj.systemTime;
	    		this.countMS = store_obj.countMS - elapsed_time;
	    		if (this.countMS <= 0) {
	    			this.countMS = 0;
 					this.status = done;
 				}
	    	} else {
	    		this.countMS = store_obj.countMS;
	    	}    		    				
		} else {
			// brand new thang
			this.durationMS = default_settings.duration * 60 * 1000;
 			var task = default_settings.task;			
		}
    
		this.id = id;
    
	    this.task = ko.observable(task);
	    		
		this.selector = "#" + this.id;		
	
		this.reset = function (new_duration) {
			if (new_duration) this.durationMS = new_duration;
			this.countMS = this.durationMS;
			this.update_status("off");
		}
		
		// interval timer
		this.inter = false;
		
		// main controller function
		this.update_status = function (status) {
			if (status) this.status = status;
			if (this.status == "on") {
				if (this.inter == false) this.inter = setInterval(this.dec_counter.bind(this), 1000);
			} else {
				clearInterval(this.inter);
				this.inter = false;
			}
			console.log(colors[this.status]);
			$(this.selector).css('background-color', colors[this.status]);    	      
			this.display();
			this.save();
		}
		
		this.display = function () {
			$(this.selector).text(moment(this.countMS).format('mm:ss'));
		}			
		
		// decrement the counter by 1 second	
	    this.dec_counter = function () {
	        if (this.countMS > 0) {
				this.countMS -= 1000;
		        this.display();
		        this.save();
	        } else {
				this.update_status('done');
	        }
	    }
	    
	    this.save = function () {
	    	var settings = {
	    		task : this.task(),
	    		countMS : this.countMS,
	    		status : this.status,
	    		durationMS : this.durationMS,
				systemTime : Date.now()	    		
	    	}
	    	store.set(this.id, settings);
	    }
	    
	    // time edit
	    this.edit = function () {
	    	// ask user for time
	    	if (new_time = prompt("Set the timer duration:", "25:00")) {
				// validate the input and reset the clock
		    	var min_sec = new_time.split(":");
		    	if (!isNaN(min_sec[0])) {
		    		new_duration = min_sec[0] * 60 * 1000;
		    		if (!isNaN(min_sec[1])) {
		    			new_duration += min_sec[1] * 1000;
		    		}
		    		this.reset(new_duration);
		    	}
	    	}
	    }	    
	    		
	    // single click handler
		this.toggle = function () {
			$('footer').fadeOut();
			if (this.status == "done") {
				this.reset();
			} else if (this.status == "on") {
				this.update_status('paused');
			} else {
				this.update_status('on');
			}
		}.bind(this);
			    
	    // dbl click handler
	    this.dbl = function () {
	    	if (this.status == "off") {
	    		this.edit();
	    	} else {
	    		this.reset();
	    	}
	    }.bind(this);
	    
	    // bind custom function
	    $(this.selector).single_double_click(this.toggle, this.dbl, 300);
	    
	    // cache this for jquery actions
	    var self = this;

		$('#task').keyup(function() {
			self.save();
		}).blur(function() {
			if (self.task() == "") self.task(default_settings.task);
			self.save();
		});
		
		// initialization
		if (store_obj) {
			this.update_status();
	    } else {
	    	this.reset();
	    }
	    
		$('#color').click(function() {
			if (new_color = prompt("Set the timer color:", "green")) {
				colors['on'] = new_color;
				store.set('color', new_color);
				self.update_status();
	    	}
		});		
	
		$('#clear').click(function() {
			console.log('clearing');
			store.clear();
		});		

    }
    
// launch timer

	jQuery(document).ready(function() {    	
	    ko.applyBindings(new Timer('time'));			    		
	});		