/*global webkitSpeechRecognition */

(function() {
	'use strict';
	window.___gcfg = { lang: 'en' };

	function capitalize(str) {
		return str.length ? str[0].toUpperCase() + str.slice(1) : str;
	}

	if (! ('webkitSpeechRecognition' in window) ) {
		console.log('Not supported!');
		$('.si-btn', '.voiceSearch').hide();
		//return;
	} else {

		var talkMsg = 'Start Talking';
		var patience = 6;



		var speechInputWrappers = document.getElementsByClassName('si-wrapper');

		[].forEach.call(speechInputWrappers, function(speechInputWrapper) {
			// find elements
			var inputEl = speechInputWrapper.querySelector('.si-input');
			var micBtn = speechInputWrapper.querySelector('.si-btn');

			// size and position them
			var inputHeight = inputEl.offsetHeight;
			var inputRightBorder = parseInt(getComputedStyle(inputEl).borderRightWidth, 10);
			var buttonSize = 0.8 * inputHeight;
			micBtn.style.top = 0.1 * inputHeight + 'px';
			micBtn.style.height = micBtn.style.width = buttonSize + 'px';
			inputEl.style.paddingRight = buttonSize - inputRightBorder + 'px';
			speechInputWrapper.appendChild(micBtn);

			// setup recognition
			var finalTranscript = '';
			var recognizing = false;
			var timeout;
			var oldPlaceholder = null;
			var recognition = new webkitSpeechRecognition();
			recognition.continuous = true;

			function restartTimer() {
				timeout = setTimeout(function() {
					recognition.stop();
				}, patience * 1000);
			}

			recognition.onstart = function() {
				oldPlaceholder = inputEl.placeholder;
				inputEl.placeholder = talkMsg;
				recognizing = true;
				micBtn.classList.add('listening');
				restartTimer();
			};

			recognition.onend = function() {
				recognizing = false;
				clearTimeout(timeout);
				micBtn.classList.remove('listening');
				if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;
			};

			recognition.onresult = function(event) {
				clearTimeout(timeout);
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						finalTranscript += event.results[i][0].transcript;
					}
				}
				finalTranscript = capitalize(finalTranscript);
				inputEl.value = finalTranscript;
				restartTimer();
			};

			micBtn.addEventListener('click', function(event) {
				event.preventDefault();
				if (recognizing) {
					recognition.stop();
					return;
				}
				inputEl.value = finalTranscript = '';
				recognition.start();
			}, false);
		});
	}


	$('#voiceSearch').click(function () {
		demo();
		$('form', '.voiceSearch').slideDown();
	});

	$('#voiceClear').click(function () {
		$('form', '.voiceSearch').slideUp();
		$('input', '.voiceSearch').val('');
		$('input[name=preferedClass]:first', '.voiceSearch').parents('label').trigger('click');
		$('#result').empty();
	});

	$('#originAirport, #destinationAirport', '.voiceSearch').bind('typeahead:render', function (ev, item) {
		if (item && item.value) {
			$(this).val(item.value);
		}
	});


	function demo() {
		var form = $('input[name=voiceSearch]');
		var text = $.trim(form.val());
		text = text.replace(/\bone|fir(?= st)/ig,"1");
		text = text.replace(/\btwo|seco(?= nd)/ig,"2");
		text = text.replace(/\bthree|thi(?= rd)/ig,"3");
		text = text.replace(/\bfour/ig,"4");
		text = text.replace(/\bfive/ig,"5");
		text = text.replace(/\bsix/ig,"6");
		var out_field = document.getElementById("result");
		// document.getElementById("disclaimers").innerHTML = "";

		if (/Fly me to the moon/i.exec(text)) {
			out_field.innerHTML = "Meri says: <br> &nbsp; &nbsp;Fill my heart with song and<br>"
			+ "&nbsp;&nbsp; Let me sing for ever more<br> &nbsp;&nbsp; You are all I long for<br>"
			+ "&nbsp;&nbsp; All I worship and adore";
			return;
		}
		out_field.innerHTML = "Meri says: ";

		var cities = parseCities(text);
		if (cities && (cities[0] || cities[1])) {
			if (cities[0]) {
				$('#originAirport', '.voiceSearch').typeahead('val', cities[0]);
			} else cities[0] = "an unknown airport";
			if (cities[1]) {
				$('#destinationAirport', '.voiceSearch').typeahead('val', cities[1]);
			} else cities[1] = "an unknown airport";
			out_field.innerHTML = out_field.innerHTML
			+ "<u>here is what I understood </u> - <br>"
			+ "&nbsp;&nbsp;&nbsp; The trip is from <b>" + cities[0] + "</b> to <b>" + cities[1] + "</b>";
		} else {
			out_field.innerHTML = out_field.innerHTML + "&nbsp;  I did not understand where you are flying to.<br><br><br>";
			return;
		}

		var dates = parseDates(text);
		if (dates) {
			var leaving = "an unknown date", returning;
			if (dates[0]) {
				var _month = dates[0].getMonth() + 1,
						_day = dates[0].getDate();
				if (_month < 10) _month = '0' + _month;
				if (_day < 10) _day = '0' + _day;
				$('input[name=departureDate]', '.voiceSearch').val(dates[0].getFullYear() + '-' +	_month + '-' + _day);
				leaving = dates[0].toDateString();
				//$('input[name=departureDate]', '.voiceSearch').val(leaving);
			}
			if (dates[1]) {
				var _month = dates[1].getMonth() + 1,
						_day = dates[1].getDate();
				if (_month < 10) _month = '0' + _month;
				if (_day < 10) _day = '0' + _day;
				$('input[name=returnDate]', '.voiceSearch').val(dates[1].getFullYear() + '-' + _month + '-' + _day);
				returning = dates[1].toDateString();
				//$('input[name=returnDate]', '.voiceSearch').val(returning);
			}
			out_field.innerHTML = out_field.innerHTML + ", leaving on <b> " + leaving + "</b>"
			+ (returning ? " returning on <b> " + returning + "</b>." : ".");
		} else {
			out_field.innerHTML = out_field.innerHTML + "<b>I did not find dates in your request.</b>";
			return;
		}

		var num = parseNumTix(text);
		var cls = parseClass(text);

		if (cls) {
			$('input[name=preferedClass]', '.voiceSearch').each(function (i, o) {
				var _txt = $(o).parents('label').text();
				if (_txt.toLowerCase().indexOf(cls.toLowerCase()) != -1) {
					$(o).prop('checked', true);
					$(o).parents('label').trigger('click');
				}
			});
		}

		if (num && (num > 0 || num == "multiple")) {
			out_field.innerHTML = out_field.innerHTML + "<br>&nbsp;&nbsp;&nbsp; You need <b>" + num
			+ (num == 1 ? " ticket" : " tickets") + "</b>"
			+ (cls ? " in <b>" + cls + " class</b>" : "") + ".<br>";
		} else if (cls) {
			out_field.innerHTML = out_field.innerHTML + "<br>&nbsp;&nbsp;&nbsp; You are travelling in <b>" + cls + "</b> class.";
		} else out_field.innerHTML = out_field.innerHTML + "<br><br>";
	}

	function parseDates(str) {
		var today = new Date();
		var dates = [];
		if (/today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i.exec(str)) dates[0] = today.toDateString();
		if (/(?! after\s*)tomorrow/i.exec(str)) {
			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			if (dates.length == 1) return [today, tomorrow];
			dates[0] = tomorrow.toDateString();
		}

		var dateRegex = /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/ig;
		var match = dateRegex.exec(str)
		if (match) dates.push(match[0]);

		match = dateRegex.exec(str);
		if (match) dates[1] = match[0];

		for (var i = 0; i != dates.length; i++) {
			if (!/\d{4}/.exec(dates[i])) dates[i] = dates[i] + " " + today.getFullYear();
			dates[i] =  new Date(dates[i]);
		}
		if (dates.length == 2 && dates[1].getTime() < dates[0].getTime()) {
			var year = dates[1].getFullYear();
			dates[1].setFullYear(++year);
		}

		if (dates.length <= 1) {
			var back = new Date();
			if (dates.length == 1) back = new Date(dates[0]);

			if (/the next day/i.exec(str)) {
				if (! /[A-Z][A-z\-]+\s+the next day/.exec(str)) {
					back.setDate(back.getDate() + 1);
					dates.push(back);
					return dates;
				}
			}
			if (/(in (a|1)|next) week/i.exec(str)) {
				back.setDate(back.getDate() + 7);
				dates.push(back);
				return dates;
			}
			match = /\d(?= week)/i.exec(str);
			if (match) {
				back.setDate(back.getDate() + 7 * match[0]);
				dates.push(back);
				return dates;
			}
			match = /\d(?= day)/i.exec(str);
			if (match) {
				back.setDate(back.getDate() + 1 * match[0]);
				dates.push(back);
				return dates;
			}
			match = /\d{1,2}(?=(st|nd|rd|th))/i.exec(str);
			if (match) {
				back.setDate(match[0]);
				if (back.getTime() < dates[0].getTime()) {
					var month = back.getMonth();
					back.setMonth(++month);
				}
				dates.push(back);
				return dates;
			}
		}

		return dates;
	}


	function parseCities(str) {
		var cities = parseCitiesWorker(str);
		// now remove trailing months ("Hong Kong, August") and commas ("Boston"),
		// but preserve states and countries ("Portland, Maine" and "Odessa, Ukraine")
		for (var c in cities) {
			if (cities[c]) {
				cities[c] = cities[c].replace(/,\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).*/,"");
				if (',' == cities[c].slice(-1)) cities[c] = cities[c].slice(0, -1);
			}
		}
		return cities;
	}

	function parseCitiesWorker(str) {
		var fromRegex = /\b([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
		var toRegex = /\b([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
		str = str.replace(/\b[Ss]t. ?/ig,"St ");  // St. Paul, St. Peterburg
		str = str.replace(/\b[Ff]t. ?/ig,"Ft ");  // Ft. Lauderdale
		var from = fromRegex.exec(str);
		var to = toRegex.exec(str);
		var from0, to0;
		if (from) from0 = from[0].replace(/([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)/,"");
		if (to) to0 = to[0].replace(/([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)/,"");
		if (!from && to) {
			var altRegex1 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}\s+to\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
			var match = altRegex1.exec(str);
			if (match) {
				var cities = match[0].split(" to ");
				return [cities[0], cities[1]];
			}
		}
		if (from && !to) {
			var altRegex2 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,){0,2}\s+from\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
			var match = altRegex2.exec(str);
			if (match) {
				var cities = match[0].split(" from ");
				return [cities[1], cities[0]];
			}
		}
		if (!from && !to) {
			var comboRegex = /[A-Z][A-z]+-[A-Z][A-z]+/;
			var match = comboRegex.exec(str);
			if (match) {
				var cities = match[0].split("-");
				return [cities[0], cities[1]];
			}
		}
		return [from0, to0];
	}

	function parseClass(text) {
		if (/economy/i.exec(text)) return "economy";
		else if (/premium/i.exec(text)) return "premium";
		else if (/business/i.exec(text)) return "business";
		else if (/first/i.exec(text)) return "first";
		var match = /\w+\s*(?= class)/i.exec(text);
		if (match) return match[0];
		return null;
	}

	function parseNumTix(text) {
		if (/\b(ticket|needs|by myself)\b/i.exec(text)) return 1;
		var match = /\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i.exec(text);
		if (match) return match[0].replace(/\s.*/,"");

		if (/s\s+(with|and)\s+(I|myself|me)\b/i.exec(text)) return 3;
		if (/\b(with|and)\s+(I|myself|me)\b/i.exec(text)) return 2;
		if (/\b(with|and)\s+my\s+\w+s\b/i.exec(text)) return 3;
		if (/\b(with|and)\s+(my|a)\b/i.exec(text)) return 2;
		if (/and\s*my\s+\w+s\b/i.exec(text)) return 2;

		if (/\b([Ww]e|are)\s+/.exec(text)) return "multiple";
		if (/\b[Oo]ur\s+/.exec(text)) return "multiple";
		if (/\b(children|students|a group)\s+/i.exec(text)) return "multiple";
		if (/tickets/i.exec(text)) return "multiple";

		if (/[Hh]ow much does it cost/.exec(text)) return 1;

		// This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
		if (/\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i.exec(text)) return 1;
		return null;
	}

})();