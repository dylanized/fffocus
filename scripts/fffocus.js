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
		on			: 'green',
		paused		: '#ccc',
		done		: 'orange'
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
		this.dateObj = new Date(0, 0, 0, 0, 0, 0);
		
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
			console.log("pre: " + this.inter);
			if (this.status == "on") {
				if (this.inter == false) this.inter = setInterval(this.dec_counter.bind(this), 1000);
			} else {
				clearInterval(this.inter);
				this.inter = false;
			}
			$(this.selector).css('background-color', colors[this.status]);    	      
			this.display();
			this.save();
		}
		
		this.display = function () {
			this.dateObj.setTime(this.countMS);
			var min = this.dateObj.getMinutes();
			var sec = this.dateObj.getSeconds();
			if (!sec) {
				sec = "00";
			}
			if (sec.toString().length == 1) {
				sec = ("0" + sec);
			}
			$(this.selector).text(min + ":" + sec);
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
	    	var new_time = prompt("Set the timer duration:", "25:00");
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
		});  

		$('#task').blur(function() {
			if (self.task() == "") self.task(default_settings.task);
			self.save();
		});
		
		// initialization
		if (store_obj) {
			this.update_status();
	    } else {
	    	this.reset();
	    }

    }
    
// launch timer

	jQuery(document).ready(function() {    
	
	    ko.applyBindings(new Timer('time'));	    
	
		$('#debug').click(function() {
			console.log('clearing');
			store.clear();
		});	 
			    		
	});		