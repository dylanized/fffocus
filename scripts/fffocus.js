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

	var minutes = 1;
	
	var counting = false;
	var count;
	var inter;	
	var paused = false;
    var d = new Date(0, 0, 0, 0, 0, 0);	
    
// timer helper funcs
    	
	function reset_timer() {
		count = minutes * 60 * 1000;
		clearInterval(inter);
		counting = false;	
		paused = false;
	    set_time();				
		color();
		display_time(minutes);
	}    
    
    function set_time() {
		d.setTime(count);    
    }
    
    function color(col) {
    	if (!col) col = "#ccc";
		$('#time').css('background-color', col);    
    }
    	
	function display_time(min, sec) {
		if (!sec) {
			sec = "00";
		}
		if (sec.toString().length == 1) {
			sec = ("0" + sec);
		}
		$('#time').text(min + ":" + sec );
	}    
	
	function toggle_start() {		
		$('#footer').fadeOut();	
		if (counting) {		
			if (paused) {
				start_timer();
			} else {
				pause_timer();
			}								
		} else {			
			start_timer();							
		}		
	}
    
    function start_timer() {
    	counting = true;
		paused = false;    	
    	color('green');    	
 		inter = setInterval(dec_counter, 1000);
    }
    
    function pause_timer() {
		color();
		paused = true;
		clearInterval(inter);    
    }

    function dec_counter(t) {
        if (count > 0) {
			count -= 1000;
	        set_time();
	        display_time(d.getMinutes(), d.getSeconds());            
	    	// console.log(d);  
        } else {
            clearInterval(inter);
            callback();
        }
    }
	
// build timer	
	
	$(document).ready(function() {
	
		reset_timer();	
						
		$('#time').single_double_click(toggle_start, reset_timer, 200);
	
	});