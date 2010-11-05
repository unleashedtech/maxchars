/*
 * MaxChars Plugin for jQuery
 * Version 1.0.0
 * http://www.unleashed-technologies.com/
 *
 * Copyright 2010, Unleashed Technologies, LLC
 * Released under the MIT License.
 * http://www.unleashed-technologies.com/projects/maxchars/MIT-LICENSE.txt
 */
(function ($) {

	// Feel free to change these default values
	var defaults =
	{
		'maxChars'				: false,
		'showExtraChars'		: true,
		'messageHolder'			: function (t) { return $('<span class="maxchars-message"></span>').insertAfter(t); }
	};
	
	// Don't edit below this line, unless you know what you're doing
	
	// Internal data goes here and will override any provided options with the same keys
	var internals =
	{
		'messageHolderWasDynamicallyCreated' : false
	};
	
	// Events which can be bound to
	var events =
	{
		lengthChange : function (e)
		{
			// This is where the magic happens
			var $this = $(this),
				data = $this.data('maxchars'),
				currentCharCount = this.value.length,
				charsRemaining = (data.maxChars - currentCharCount);
			
			// Slightly different logic/jQuery magic is used if extra characters are allowed
			if (data.showExtraChars)
			{
				if (charsRemaining < 0)
				{
					// Too many chars in here, should we allow the extras?
					data.messageHolder.removeClass('maxchars-under-limit')
						.removeClass('maxchars-close-to-limit')
						.addClass('maxchars-over-limit')
						.html("Limit exceeded by " + (charsRemaining * -1) + " characters");
				}
				else
				{
					data.messageHolder.removeClass('maxchars-over-limit')
						.html(charsRemaining + " characters remaining");
					// Add a class to help warn users they are close (within 10% or 5 chars remaining)
					if (charsRemaining / data.maxchars <= 0.1 || charsRemaining <= 5)
					{
						data.messageHolder.addClass('maxchars-close-to-limit');
					}
					else
					{
						data.messageHolder.addClass('maxchars-under-limit')
							.removeClass('maxchars-close-to-limit');
					}
				}
			}
			else
			{
				// If extra characters are not allowed, we strip all the extra ones
				if (charsRemaining < 0)
				{
					$this.val($this.val().substr(0, data.maxChars));
					charsRemaining = 0;
				}
				data.messageHolder.html(charsRemaining + " characters remaining");
			}
		}
	};
	
	// Public methods
	var methods =
	{
		init: function (options)
		{
			return this.each(function ()
			{
				var $this = $(this),
					data = $this.data('maxchars');
				
				// If plugin hasn't been initialized yet on this element
				if (!data)
				{
					data = {};
					
					// Check if a number was passed instead of an object
					if (typeof options === 'number')
					{
						options = { 'maxChars' : options };
					}
					
					$.extend(data, defaults, options, internals);
					
					// Ensure a maximum was provided
					if (data.maxChars === false)
					{
						// Maybe the element has a maxlength we can use?
						if (typeof $this.attr('maxlength') === 'number')
						{
							data.maxChars = $this.attr('maxlength');
						}
						else
						{
							// No max length could be found - abort!
							return;
						}
					}
					
					// Create the message holder if needed
					if (typeof data.messageHolder === 'function')
					{
						// We are creating this dynamically.  The provided function is responsible for creating and returning
						// the element which holds the message - we simply store a reference to it.
						data.messageHolder = data.messageHolder(this);
						data.messageHolderWasDynamicallyCreated = true;
					}
					
					$this.addClass('maxchars-enabled');
					
					// Save the options for this element
					$this.data('maxchars', data);
					
					// Bind the necessary events we care about
					$this.bind('keyup.maxchars', events.lengthChange);
					$this.bind('blur.maxchars', events.lengthChange);
					
					// Trigger the keyup event so the initial message appears
					$this.trigger('keyup.maxchars');
				}
			});
		},
		destroy: function ()
		{
			return this.each(function ()
			{
				var $this = $(this),
					data = $this.data('maxchars');
				
				// Unbind all maxchars events
				$this.unbind('.maxchars');
				
				// Remove the element
				if (data && data.messageHolder && data.messageHolderWasDynamicallyCreated)
				{
					data.messageHolder.remove();
				}
				$this.removeData('maxchars');
				$this.removeClass('maxchars-enabled');
			});
		},
		isvalid: function ()
		{
			var result = true;
			// Only look at enabled elements
			this.each(function ()
			{
				try
				{
					var $this = $(this),
						data = $this.data('maxchars'),
						currentCharCount = $this.val().length,
						charsRemaining = (data.maxChars - currentCharCount);
					
					// If charsRemaining is ever less than 0, result will become false
					result &= (charsRemaining >= 0);
				}
				catch(ex)
				{
					result = false;
				}
			});
			return (result) ? true : false;
		}
	};
	

	$.fn.maxchars = function (method)
	{
		
		if (methods[method])
		{
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || typeof method === 'number' || !method)
		{
			return methods.init.apply(this, arguments);
		}
		else
		{
			$.error('Method ' + method + ' does not exist on jQuery.maxchars');
		}
		
	};
})(jQuery);
