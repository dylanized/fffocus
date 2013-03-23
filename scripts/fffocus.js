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
		'default' 	: '#ccc',
		'on'		: 'green',
		'done'		: 'orange'
	}
	
	var settings = {
		'duration'	: 25	// in minutes
	}    
    
// define timer

	// constructor func
    Timer = function(id) {
    
		this.id = id;
		this.duration = settings.duration;	
		this.colors = colors;
		
		this.paused = false;
		
		this.durationMS = this.duration * 60 * 1000;
		this.dateObj = new Date(0, 0, 0, 0, 0, 0);
		
		this.reset = function () {
			clearInterval(this.inter);
			this.countMS = this.durationMS;
			this.paused = false;
			this.color();
			this.display(this.duration);
		}.bind(this);
		
	    this.color = function (col) {
	    	if (!col) col = this.colors.default;
			$(this.id).css('background-color', col);    
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
			$(this.id).text(min + ":" + sec);
		}
		
		this.toggle = function () {
			if (this.countMS > 0) {
				$('#footer').fadeOut();	
				if (this.countMS < this.durationMS) {		
					if (this.paused) {
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
	    
	    this.start = function () {
			this.paused = false;    	
	    	this.color(this.colors.on);    	
	 		this.inter = setInterval(this.dec_counter.bind(this), 1000);
	    }
	    
	    this.pause = function () {
			this.color();
			this.paused = true;
			clearInterval(this.inter);    
	    }
	
	    this.dec_counter = function () {
	        if (this.countMS > 0) {
				this.countMS -= 1000;
		        this.display();
		        store.set('timer', { id: this.id, countMS : this.countMS, paused : this.paused })
		        // store.set(this.id, this.countMS);            
	        } else {
				this.stop();
	        }
	    }
	    
	    this.stop = function() {
	        this.color(this.colors.done);
	        this.paused = false;
	   		clearInterval(this.inter);
	   		store.remove('timer');
	    }   
	    
	    this.resume = function(timer_obj) {
	    	this.countMS = timer_obj.countMS;
	    	this.paused = timer_obj.paused;
			this.display();
	    	this.start();
	    }
	    	    	
    }
    
// launch page	
	
    timer = new Timer('#time');
    
	$(document).ready(function() {
	
		if (store.get('timer')) {
			timer.resume(store.get('timer'));	
		} else {
			timer.reset();
		}					
		
		$(timer.id).single_double_click(timer.toggle, timer.reset, 300);
			
	});