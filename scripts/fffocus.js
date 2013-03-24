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
		'off' 		: '#ccc',
		'on'		: 'green',
		'paused'	: '#ccc',
		'done'		: 'orange'
	}
	
	var default_settings = {
		'duration'	: 25	// in minutes
	}    
    
// define timer

	// constructor func
    Timer = function(id) {
    
	    // resume from local store
		if (store.get(id)) {
			var store_obj = store.get(id);
	    	this.countMS = store_obj.countMS;
	    	this.status = store_obj.status;			
 			this.durationMS = store_obj.durationMS;
		} else {
			this.durationMS = ( default_settings.duration * 60 * 1000 );
		}
    
		this.id = id;
		
		this.selector = "#" + this.id;		
		this.dateObj = new Date(0, 0, 0, 0, 0, 0);
		
		this.reset = function () {
			clearInterval(this.inter);
			this.countMS = this.durationMS;
			this.update_status("off");
			this.display(this.duration);
		}.bind(this);
		
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
		
		this.toggle = function () {
			if (this.countMS > 0) {
				$('#footer').fadeOut();	
				if (this.countMS < this.durationMS) {		
					if (this.status == 'paused') {
						this.start();
					} else {
						this.pause();
					}								
				} else {			
					this.start();							
				}		
			} else {
				this.reset();	
			}
		}.bind(this);
		
		this.update_status = function (status) {
			this.status = status;
			$(this.selector).css('background-color', colors[status]);    	      
			this.save();
		}
	    
	    this.start = function () {
			this.update_status('on');    	
	 		this.inter = setInterval(this.dec_counter.bind(this), 1000);
	    }
	    
	    this.pause = function () {
			this.update_status('paused');
			clearInterval(this.inter);    
	    }
	
	    this.dec_counter = function () {
	        if (this.countMS > 0) {
				this.countMS -= 1000;
		        this.display();
		        this.save();
	        } else {
				this.done();
	        }
	    }
	    
	    this.save = function () {
	    	store.set(this.id, { countMS : this.countMS, status : this.status, durationMS : this.durationMS });
	    }
	    
	    this.done = function() {
	        this.update_status('done');
	   		clearInterval(this.inter);
	    }	
	    
		if (store_obj) {
			this.display();
	    	if (this.status == "on") this.start();
	    } else {
	    	this.reset();
	    }
	    
	    $(this.selector).single_double_click(this.toggle, this.reset, 300);

    }
    
// launch page

	$(document).ready(function() {		
	    timer = new Timer('time');		
	});