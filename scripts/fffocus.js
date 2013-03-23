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
		'time'		: 25
	}    
    
// define timer

	// constructor func
    Timer = function(id) {
    
		this.id = id;
		this.minutes = settings.time;	
		this.colors = colors;
		
		this.counting = false;
		this.paused = false;
		this.d = new Date(0, 0, 0, 0, 0, 0);
		    
		this.reset = function () {
			this.count = this.minutes * 60 * 1000;
			clearInterval(this.inter);
			this.counting = false;	
			this.paused = false;
		    this.d.setTime(this.count);
			this.color();
			this.display(this.minutes);
		}.bind(this);
		
	    this.color = function (col) {
	    	if (!col) col = this.colors.default;
			$(this.id).css('background-color', col);    
	    }   
		
		this.display = function (min, sec) {
			if (!sec) {
				sec = "00";
			}
			if (sec.toString().length == 1) {
				sec = ("0" + sec);
			}
			$(this.id).text(min + ":" + sec);
		}
		
		this.toggle = function () {
			if (this.count > 0) {
				$('#footer').fadeOut();				
				if (this.counting) {		
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
	    	this.counting = true;
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
	        if (this.count > 0) {
				this.count -= 1000;
		        this.d.setTime(this.count);
		        this.display(this.d.getMinutes(), this.d.getSeconds());            
		    	// console.log(d);  
	        } else {
	            clearInterval(this.inter);
	            this.color(this.colors.done);
	            this.counting = false;
	            this.paused = false;
	        }
	    }    	
    }
    
    timer = new Timer('#time');
    
// launch page	
	
	$(document).ready(function() {
	
		timer.reset();						
		$(timer.id).single_double_click(timer.toggle, timer.reset, 300);
	
	});