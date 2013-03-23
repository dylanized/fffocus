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

// instantiate timer vars

	var counting = false;
	var count;
	var inter;	
	var paused = false;
    var d = new Date(0, 0, 0, 0, 0, 0);
    
// colors

	var colors = {
		'default' 	: '#ccc',
		'on'		: 'green',
		'done'		: 'orange'
	}
	
	var settings = {
		'time'		: 25
	}    
    
// timer helper funcs

    timer = {};
    
	timer.minutes = settings.time;
	
	timer.colors = colors;
	
	timer.id = "#time";
    
	timer.reset = function() {
		count = this.minutes * 60 * 1000;
		clearInterval(inter);
		counting = false;	
		paused = false;
	    set_time();	
	    //console.log(this);
		this.color();
		display_time(this.minutes);
	}    
    
    function set_time() {
		d.setTime(count);    
    }
    
    timer.color = function(col) {
    	if (!col) col = this.colors.default;
		$(this.id).css('background-color', col);    
    }
    	
	function display_time(min, sec) {
		if (!sec) {
			sec = "00";
		}
		if (sec.toString().length == 1) {
			sec = ("0" + sec);
		}
		$(timer.id).text(min + ":" + sec);
	}    
	
	timer.toggle = function () {
		if (count > 0) {
			$('#footer').fadeOut();				
			if (counting) {		
				if (paused) {
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
	}
    
    timer.start = function () {
    	counting = true;
		paused = false;    	
    	this.color(this.colors.on);    	
 		inter = setInterval(timer.dec_counter.bind(timer), 1000);
    }
    
    timer.pause = function () {
		this.color();
		paused = true;
		clearInterval(inter);    
    }

    timer.dec_counter = function () {
        if (count > 0) {
			count -= 1000;
	        set_time();
	        display_time(d.getMinutes(), d.getSeconds());            
	    	// console.log(d);  
        } else {
            clearInterval(inter);
            this.color(this.colors.done);
            counting = false;
            paused = false;
        }
    }
	
// build timer	
	
	$(document).ready(function() {
	
		timer.reset();						
		$(timer.id).single_double_click(timer.toggle.bind(timer), timer.reset.bind(timer), 200);
	
	});