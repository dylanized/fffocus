// helper functions

	// disable dbl click text select
	
		$(function(){
		    $.extend($.fn.disableTextSelect = function() {
		        return this.each(function(){
		            if($.browser.mozilla){//Firefox
		                $(this).css('MozUserSelect','none');
		            }else if($.browser.msie){//IE
		                $(this).bind('selectstart',function(){return false;});
		            }else{//Opera, etc.
		                $(this).mousedown(function(){return false;});
		            }
		        });
		    });
		    $('.noSelect').disableTextSelect();//No text selection on elements with a class of 'noSelect'
		});
		
	// single double click func
		
		// Author:  Jacek Becela
		// Source:  http://gist.github.com/399624
		// License: MIT
		 
		jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {	
		  return this.each(function(){
		    var clicks = 0, self = this;
		    jQuery(this).click(function(event){
		      clicks++;
		      if (clicks == 1) {
		        setTimeout(function(){
		          if(clicks == 1) {
		            single_click_callback.call(self, event);
		          } else {
		            double_click_callback.call(self, event);
		          }
		          clicks = 0;
		        }, timeout || 300);
		      }
		    });
		  });
		}
	
// session config

	var colors = {
		off 		: '#ccc',
		on			: '#000',
		paused		: '#ccc',
		done		: 'orange'
	}
	
	if (store.get('color')) {
		colors.on = store.get('color');
	}
	
	var defaults = {
		duration	: 25,	// in minutes
		task		: "what are you doing?"
	} 
	
// define timer

	// constructor func
    Timer = function(id) {
    
    	this.countMS = ko.observable();
    	this.status = ko.observable();
    	    
		if (store.get(id)) {
			// resume from local store
			var store_obj = store.get(id);	    	
	    	this.status(store_obj.status);
 			this.durationMS = store_obj.durationMS;
 			var task = store_obj.task;
 			if (task == "") var task = defaults.task;			
    		// if it was running, subtract elabsed time
	    	if (this.status() == 'on') {
	    		var elapsed_time = Date.now() - store_obj.systemTime;
	    		this.countMS(store_obj.countMS - elapsed_time);
	    	} else {
	    		this.countMS(store_obj.countMS);
	    	}    		    				
		} else {
			// brand new thang
			this.durationMS = defaults.duration * 60 * 1000;
 			var task = defaults.task;			
		}
    
		this.id = id;
    
	    this.task = ko.observable(task);
	    		
		this.selector = "#" + this.id;		
	
		this.reset = function (new_duration) {
			if (new_duration) this.durationMS = new_duration;
			this.countMS(this.durationMS);
			this.task(defaults.task);
			$('#task').blur();
			$('footer').fadeIn();
			this.update("off");
		}
		
		// interval timer
		this.inter = false;
		
		// main controller function
		this.update = function (status) {
    		if (this.countMS() <= 0) {
    			this.countMS(0);
				status = 'done';
			}	
			if (status) this.status(status);
			if (this.status() == "on") {
				if (this.inter == false) this.inter = setInterval(this.dec_counter.bind(this), 1000);
			} else {
				clearInterval(this.inter);
				this.inter = false;
			}
			$(this.selector).css('background-color', colors[this.status()]);    	      
			this.save();
		}
			    
	    // formatted duration
		this.duration = ko.computed(function() {
			var formatted = moment(this.countMS()).format('m:ss');
			if (this.status() == 'on' || this.status() == 'paused') {
				$('title').text(formatted + " " + this.task());
			}
			return formatted;
		}, this);
		
		// decrement the counter by 1 second	
	    this.dec_counter = function () {
	        if (this.countMS() > 0) {
	        	var new_count = this.countMS() - 1000;
				this.countMS(new_count);
		        this.save();
	        } else {
				this.update('done');
	        }
	    }
	    
	    // save to local store
	    this.save = function () {
	    	var settings = {
	    		task : this.task(),
	    		countMS : this.countMS(),
	    		status : this.status(),
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
			$('#task').blur();
			$('footer').fadeOut();
			if (this.status() == "done") {
				this.reset();
			} else if (this.status() == "on") {
				this.update('paused');
			} else {
				// if the task is not set, ask for it	
				if (this.status() == "off" && this.task() == defaults.task) {
					if (new_task = prompt(defaults.task, "")) {
						if (new_task.length > 0) this.task(new_task);
					}
				}
				// start the timer
				this.update('on');
			}
		}.bind(this);
			    
	    // dbl click handler
	    this.dbl = function () {
	    	if (this.status() == "off") {
	    		this.edit();
	    	} else {
	    		this.reset();
	    	}
	    }.bind(this);
	    
	    // bind custom function
	    $(this.selector).single_double_click(this.toggle, this.dbl, 300);
	    
	    // cache this for jquery actions
	    var self = this;    

		// editable task behavior
		$('#task').focus(function() {
			if (self.task() == defaults.task) self.task('');
		}).keyup(function() {
			self.save();
		}).blur(function() {
			if (self.task() == "") self.task(defaults.task);
			self.save();
		});	
		
		// initialization
		if (store_obj && (this.status() != 'done')) {
			this.update();
	    } else {
	    	this.reset();
	    }
	    
	    // secret buttons
		$('#color').click(function() {
			if (new_color = prompt("Set the timer color:", "green")) {
				colors['on'] = new_color;
				store.set('color', new_color);
				self.update();
	    	}
		});			
		$('#clear').click(function() {
			self.reset();
			store.clear();
		});		

    }
    
// launch timer

	jQuery(document).ready(function() {    	
	    ko.applyBindings(new Timer('time'));			    		
	});		