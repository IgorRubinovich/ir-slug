(function() {
	Polymer({
		is : "ir-slug",
		
		ready : function() {
			this._originalValue = this.getAttribute('value');
		},
		
		observers : ["valueChanged(value)"],
		
		valueChanged : function() {
			this.fire('change', this.value);
		},
		
		attached : function() {
			var el, els, that = this, m, mk, mv, i;
			this.isAttached = true;

			this.transliterator = translitEngine(transliterationTable);

			if(this.source)
				el = document.querySelector(this.source);

			if(!el)
			{
				els = document.querySelectorAll('[name="' + this.name + '"]');

				el = els[0];
				i = 1;
				while(el && el == this)
					el = els[i++];
			}

			this.sourceElement = el;
			this.nativeInputElement = document.createElement('input');
			
			Polymer.dom(this).appendChild(this.nativeInputElement);

			this.nativeInputElement.value = this.value;
			this.nativeInputElement.addEventListener("change", this.slugChanged.bind(this));
			this.nativeInputElement.addEventListener("keyup", this.slugChanged.bind(this));
			this.nativeInputElement.setAttribute('name', this.name || this.sourceElement.name);
			
			
			if(this.size)
				this.nativeInputElement.setAttribute('size', this.size);
			
			if(!this.sourceElement)
				return;

			this.nativeInputElement.value = that.get(this.valueAttr, this.sourceElement);
			this.sourceElement.addEventListener(this.onEvent, function(e) {
				that.nativeInputElement.value = that.transliterator(that.get(that.valueAttr, that.sourceElement));
				that.slugChanged();
			});
		},
		
		detached : function() {
			console.count("is-slug detached");
			this.isAttached = false;
		},
		
		slugChanged : function() {
			var res = this.transliterator(this.nativeInputElement.value),
				spres = this.keepWhitespace ?
						res.replace(/\s/g, this.whitespaceChar) :
						res.replace(new RegExp("[" + this.whitespaceChar + "\\s]+", "g"), this.whitespaceChar);
		
			if((this.value != res) || (res != spres))
			{
				this.set("value", this.nativeInputElement.value = spres);
			}
			this.retryCount = 0;
		},
			
		checkUrlAvailability : function(immediate) {
			var that = this;
			
			if(!this.slugCheckUrl || !this.value)
				return;
 			
			if(this.value == this._originalValue)
				return;

			var timeout = this.slugCheckDelay * 1000;
			
			if(immediate === true)
			{
				this._slugCheckWaitStart = null;
				timeout = 0;
			}
			else
				this._slugCheckWaitStart = (new Date()).getTime();
			
			if(this._slugCheckTimeout)
				clearTimeout(this._slugCheckTimeout);

			this._slugCheckTimeout =
				setTimeout(function() {
					that.$.slugChecker.url = that.slugCheckUrl.replace(/\[slug\]/, encodeURIComponent(that.value));
					that.$.slugChecker.generateRequest();

					clearTimeout(that._slugCheckTimeout);
					that._slugCheckTimeout = null;
				}, timeout);
		},
		
		_receivedSlugCheckerResponse : function(e) {
			var v;
			
			this.set("checkedSlug", true);
			this.set("isSlugAvailable", !e.detail.status && (e.detail.request.status == 404));
			this.set("isUrlOld", false);
			
			if(!this.isSlugAvailable && this.autoSuggest)
			{
				if(!this.retryCount)
				{
					this.retryBase = this.value;
					this.retryCount = 1;
				}
				else
					this.retryCount++;

				if(this.attributes.value.value != this.value)
				{

					v = this.retryBase + this.whitespaceChar + this.retryCount;
					if(v != this.value)
						this.value = this.nativeInputElement.value = v;

					this.checkUrlAvailability(true);
				}
				else
				{
					this.value = this.nativeInputElement.value = this.retryBase;
					this.set("isUrlOld", true);
				}
			}
			Polymer.dom.flush();
		},
		
		_transliterationTableChanged : function() {
			transliterationTable = this.transliterationTable;
		},
		
		_or : function() {
			return Array.prototype.slice.call(arguments).reduce(function(p, a) { return p || a }, false);			
		},

		/** value of the reflected element */
		properties : {
			/** Specifies input name that will be submitted as part of the form. if not provided will attempt to use source element's name */
			name : { type : String },
			/** URL to request to check for slug availability. Use [slug] as a placeholder for the current value, e.g.: http://example.com/[slug]/ */
			slugCheckUrl : { type : String },
			/** id of source element to reflect. if not provided will try to match by name */
			source : { type : String },
			/** value field to reflect on source element */
			valueAttr : { type : String, value : "value" },
			/** current slug value */
			value : { type : String, value : "", observer : "checkUrlAvailability" },
			/** character to replace whitespace with */
			whitespaceChar : { type : String, value : "-" },
			/** if true will not condense multiple whitespaces into one */
			keepWhitespace : { type : Boolean },
			/** event on source element that triggers updates */
			onEvent : { type : String, value : "keyup" },
			/** automatically replace the value with next available */
			autoSuggest : { type : Boolean },

			/** message to display when slug is available */
			msgSlugIsAvailable : { type : String, value : "slug is available", notify : true },

			/** message to display when slug is not available */
			msgSlugIsNotAvailable : { type : String, value : "slug is not available", notify : true },

			/** message to display when slug is not available */
			msgIsLoading : { type : String, value : "checking", notify : true },
			
			/** is now checking */
			isLoading : { type : Boolean, value : false, notify : true },
			
			/** custom transliteration table */
			transliterationTable : { type : Object, value : transliterationTable, observer : "_transliterationTableChanged" },

			/** seconds to wait after last change before checking availability */
			slugCheckDelay : { type : Number, value : .4 },
			
			/** don't access native input element if detached*/
			isAttached : {type : Boolean, value : true},
			/** input field size*/
			size : {type : Number, value : true}
		}
	});
	
	
	
	// translit engine
	
	
	'use strict';
	var transliterationTable = {
		'А':'A',
		'а':'a',
		'Б':'B',
		'б':'b',
		'В':'V',
		'в':'v',
		'Г':'G', // russian
		'г':'g', // russian
		'Ґ':'G',
		'ґ':'g',
		'Д':'D',
		'д':'d',
		'Е':'E',
		'е':'e',
		'Ё':'E',
		'ё':'e',
		'Є':'Ye',//just on the word beginning
		'є':'ie',
		'Ж':'Zh',
		'ж':'zh',
		'З':'Z',
		'з':'z',
		'И':'I',
		'и':'i',
		'І':'I',
		'і':'i',
		'Ї':'Yi',//just on the word beginning
		'ї':'i',
		'Й':'Y',//just on the word beginning
		'й':'i',
		'К':'K',
		'к':'k',
		'Л':'L',
		'л':'l',
		'М':'M',
		'м':'m',
		'Н':'N',
		'н':'n',
		'О':'O',
		'о':'o',
		'П':'P',
		'п':'p',
		'Р':'R',
		'р':'r',
		'С':'S',
		'с':'s',
		'Т':'T',
		'т':'t',
		'У':'U',
		'у':'u',
		'Ф':'F',
		'ф':'f',
		'Х':'Kh',
		'х':'kh',
		'Ц':'Ts',
		'ц':'ts',
		'Ч':'Ch',
		'ч':'ch',
		'Ш':'Sh',
		'ш':'sh',
		'Щ':'Shch',
		'щ':'shch',
		'Ы':'Y',
		'ы':'y',
		'Э':'E',
		'э':'e',
		'Ю':'Yu',//just on the word beginning
		'ю':'iu',
		'Я':'Ya',//just on the word beginning
		'я':'ia',
		'Ь':'',//not transliterated
		'ь':'',//not transliterated
		'Ъ':'',//not transliterated
		'ъ':'',//not transliterated
		"'":''//not transliterated
	}

	// adapted from https://github.com/gausby/translitit-engine
	var translitEngine = function (table) {
		var keys, specialCases, singleLetter,
			searchPattern, lookupTable,
			i = 0
			;

		// If no transliteration table is given, return a function that will
		// return the input.
		if (!table) {
			console.log('no table')
			return function (subject) {
				return subject;
			};
		}


		// Function used by the resulting replace function
		lookupTable = function (input) {
			return input in table ? table[input] : input;
		};


		// Fetch and sort the keys in the translitteration table object, to
		// ensure the longest keys in the table is first in the array. Then
		// it will find the position of the first one-letter index and split
		// the keys into single letter indexes and longer 'specialCases.'
		keys = Object.keys(table).sort(function (a,b) {
			return b.length - a.length;
		});

		for (; keys[i]; i += 1) {
			if (keys[i].length === 1) {
				break; // first one-letter index has been found, break out
			}
		}

		specialCases = keys.slice(0,i).join('|');
		singleLetter = keys.slice(i).join('');
		keys = undefined; // reset keys


		// Compile a regular expression using the keys found in the given
		// translitteration object.
		//
		// specialCases are joined together with a pipe; `|`
		// singleLetters joined together and wrapped in square brackets so
		// that the resulting regular expressing have the following format:
		//
		//     /aa|bb|cc|[abc]/g
		//
		// This should create a working regular expression that will look
		// for every key in the transliteration table.
		searchPattern = new RegExp([
			specialCases,
			singleLetter ? '[' + singleLetter + ']' : ''
		].join(singleLetter && specialCases ? '|' : ''), 'g');


		/**
		 * Search for occurrences of entries in the translitteration table
		 * and replace these with their corresponding values.
		 *
		 * @param [String] subject to transliterate.
		 * @return [String] transliterated string
		 */
		return function (subject) {
			// input sanity check, we expect a string
			if (typeof subject !== 'string') {
				// Try to run toString, if it exist
				if (subject && typeof subject.toString === 'function') {
					subject = subject.toString();
				}
				// Return an empty string on empty and falsy input values
				else {
					return '';
				}
			}

			// Replace letters in the input using the lookup table and the
			// compiled search pattern.
			return subject.replace(searchPattern, lookupTable);
		};
	};

})();
