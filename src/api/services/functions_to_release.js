module.exports = {

    compute_priceRank: function (itins)
    // adds a new field to the array of itineraries: priceRank
    {
        if (itins.length == 0) return; // If empty, then nothing needs to be done

        for(var i=0; i<itins.length; i++)
        {
            itins[i].priceRank = +itins[i].price; // convert string to float
            if ( itins[i].hasOwnProperty('miles') ) itins[i].priceRank -= 0.02*itins[i].miles; // discount the price by $0.02 for each earned FF mile
        }
    }, // end of function compute_priceRank

    compare_priceRank: function (a, b)
    {
        if (a.priceRank > b.priceRank) return 1;
        else if (a.priceRank < b.priceRank) return -1;
        return 0;
    }, // end of function compare_priceRank

    median_priceRank: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        if ( !itins[0].hasOwnProperty('priceRank') ) this.compute_priceRank(itins); // append priceRank field if needed

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_priceRank);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return +itins_loc[center_index].priceRank;
        else
            return (+itins_loc[center_index-1].priceRank + +itins_loc[center_index].priceRank) / 2.0;
    }, // end of function median_priceRank

    normalize_priceRank: function (itins)
    // normalizes priceRank
    {
        if (itins.length == 0) return; // If empty, then nothing needs to be done

        if ( !itins[0].hasOwnProperty('priceRank') ) this.compute_priceRank(itins); // append priceRank field if needed

        var Median_priceRank = this.median_priceRank(itins); // compute median in priceRank

        for(var i=0; i<itins.length; i++)
        {
            itins[i].priceRank /= Median_priceRank;
        }
    }, // end of function normalize_priceRank

    parseTime: function (timeString)
    // parses a string into a Date/Time object
    {
        if (timeString == '') return null;

        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
        if (time == null) return null;

        var hours = parseInt(time[1],10);
        if (hours == 12 && !time[4])
        {
            hours = 0;
        }
        else
        {
            hours += (hours < 12 && time[4])? 12 : 0;
        }
        var d = new Date();
        d.setHours(hours);
        d.setMinutes(parseInt(time[3],10) || 0);
        d.setSeconds(0, 0);
        return d;
    }, // end of function parseTime

    compute_departure_times_in_minutes: function (itins)
    // adds a new field to the array of itineraries: depatureMinutes
    {
        for(var i=0; i<itins.length; i++)
        {
            var d = this.parseTime(itins[i].citypairs[0].from.time);
            itins[i].depatureMinutes = d.getHours() *60 + d.getMinutes();
        }
    }, // end of function compute_departure_times_in_minutes

    determine_airline: function (itins)
    // adds a new field to the array of itineraries: air_line
    {
        for(var i=0; i<itins.length; i++)
            itins[i].air_line = itins[i].citypairs[0].flights[0].abbrNumber.substring(0,2); // first two characters
    }, // end of function determine_airline

    determine_airline_preferences: function (itins)
    // adds a new field to the array of itineraries: air_line_pref (the smaller the value, the better the airline is)
    {
        var light_output = false;

        var AL = itins.map(function(it){return it.air_line}); // extract all the airlines into a separate array
        if (light_output)
        {
            onvoya.log.info("Decoded airlines in the original order :");
            onvoya.log.info(AL);
        }

        var AL_counts = {};
        AL.forEach(function(x) { AL_counts[x] = (AL_counts[x] || 0)+1; });
        if (light_output)
        {
            onvoya.log.info("Their repetitions :");
            onvoya.log.info(AL_counts);
        }

        var AL_counts_keysSorted = Object.keys(AL_counts).sort(function(a,b){return AL_counts[b]-AL_counts[a]});
        if (light_output)
        {
            onvoya.log.info("Airlines sorted by popularity:");
            onvoya.log.info(AL_counts_keysSorted); // array of 2-letter airline name strings, sorted by popularity
        }

        // Now loop through AL_counts_keysSorted and take 1 airline from each key at a time (and decrease counts) until all the counts are zero.

        var preferred_airline_indices = [];

        while (preferred_airline_indices.length < itins.length)
        {
            function extract_preferred_airline_indices(value_ALname, key_idx, array_ALcounts_keys_sorted)
            {
                if (AL_counts[value_ALname]!=0)
                {
                    var idx = AL.indexOf(value_ALname); // search for the airline in the original list
                    preferred_airline_indices.push(idx); // save its position
                    AL[idx] = "00"; // replace with dummy airline
                    AL_counts[value_ALname]--; // decrease the count
                }
            }

            AL_counts_keysSorted.forEach(extract_preferred_airline_indices);
        }

        if (light_output)
        {
            onvoya.log.info("Preferred airline indices :");
            onvoya.log.info(preferred_airline_indices);

            onvoya.log.info("Preferred airlines :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = itins[preferred_airline_indices[i]].air_line; }; onvoya.log.info(temp);
            onvoya.log.info();
        }

        return preferred_airline_indices;
    }, // end of function determine_airline_preferences

    num2str: function(number,width) // prepend the number with leading spaces up to a required width
    {
      if (width === undefined) return number;
      return (Array(width).join(" ") + number).slice(-width);
    }, // end of function num2str

    number_of_digits: function(number) // compute the number of digits in an integer part of a number
    {
      return Math.log(Math.floor(number)) * Math.LOG10E + 1 | 0; // for positive numbers
    }, // end of function number_of_digits

    one_itin_to_string: function (prefix,itin,price_digits)
    // price_digits --- number of digits in the rounded-down price.
    {
        if (itin === undefined) return ''; // If undefined, then return empty sting

        var d = this.parseTime(itin.citypairs[0].from.time);

        var price_str      = "$" + this.num2str(Number(itin.price).toFixed(2),price_digits+3);
        var priceRank_str  = (itin.priceRank      ===undefined)?(""):(" (" + itin.priceRank.toFixed(10) + ")" );
        var miles_str      = (itin.miles          ===undefined)?(""):(", earning " + itin.miles + " mi" );
        var dep_rank_str   = (itin.best_dep_rank  ===undefined)?(""):(" with dep_rank " + itin.best_dep_rank);
        var air_line_str   = (itin.air_line       ===undefined)?(""):(" on " + itin.air_line);
        var airl_rank_str  = (itin.best_airl_rank ===undefined)?(""):(" with airl_rank "  + itin.best_airl_rank);
        var airl_rank2_str = (itin.best_airl_rank2===undefined)?(""):(" with airl_rank2 " + itin.best_airl_rank2);
        var smartRank_str  = (itin.smartRank      ===undefined)?(""):(", smartRank = "  + itin.smartRank );
        var why_this_str   = (itin.why_this       ===undefined)?(""):(", " + itin.why_this );

        return ( prefix + price_str + priceRank_str + miles_str
                        + ", " + itin.durationMinutes + " mins"
                        + ", departs " + itin.citypairs[0].from.time
                        //+ " (" + d.getHours() + ":" + ('0'+d.getMinutes()).slice(-2) + ")"
                        + " (" + itin.depatureMinutes + " mins)"
                        + dep_rank_str
                        + air_line_str
                        + airl_rank_str
                        + airl_rank2_str
                        + smartRank_str
                        + why_this_str
               );
    }, // end of function one_itin_to_string

    many_itins_to_string: function (itins)
    {
        if (itins.length == 0) return "No itineraries";
        if (itins.length == 1) return this.one_itin_to_string("Itinerary : ", itins[0]);
        var result = "";
        var N = this.number_of_digits(itins.length);
        var P = this.number_of_digits(Math.max.apply(null,itins.map(function(it) { return +it.price; }))); // convert string to float

        for(var i=0; i < itins.length; i++) {
          result += ("\n" + this.one_itin_to_string("Itinerary " + this.num2str(i,N) + " of " + itins.length + ": ", itins[i], P));
        }
        return result;
    }, // end of function many_itins_to_string

    print_many_itineraries: function (itins)
    {
        onvoya.log.info(this.many_itins_to_string(itins));
    }, // end of function print_many_itineraries

    compare_price: function (a, b) // price is a string
    {
        var a_price = +a.price; // convert string to float
        var b_price = +b.price; // convert string to float
        if (a_price > b_price) return  1;
        if (a_price < b_price) return -1;
        return 0;
    }, // end of function compare_price

    sort_by_increasing_price: function (itins)
    {
        itins.sort(this.compare_price);
    }, // end of function sort_by_increasing_price

    compare_in_price_by_distance_from_median: function (median) // compare by distance from the median
    {
        return function(a, b)
        {
            var a_distance_from_median = Math.abs(+a.price - median); // convert price from string to float
            var b_distance_from_median = Math.abs(+b.price - median); // convert price from string to float

            if (a_distance_from_median > b_distance_from_median) return 1;
            else if (a_distance_from_median < b_distance_from_median) return -1;
            return 0;
        }
    }, // end of function compare_in_price_by_distance_from_median

    median_in_price: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_price);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return +itins_loc[center_index].price;
        else
            return (+itins_loc[center_index-1].price + +itins_loc[center_index].price) / 2.0;
    }, // end of function median_in_price

    median_absolute_deviation_in_price: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var median_price = this.median_in_price(itins);

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_price_by_distance_from_median(median_price) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(+itins_loc[center_index].price - median_price);
        else
            return ( Math.abs(+itins_loc[center_index-1].price - median_price) +
                     Math.abs(+itins_loc[center_index  ].price - median_price) ) / 2.0;
    }, // end of function median_absolute_deviation_in_price

    compare_duration: function (a, b)
    {
        if (a.durationMinutes > b.durationMinutes) return 1;
        else if (a.durationMinutes < b.durationMinutes) return -1;
        return 0;
    }, // end of function compare_duration

    sort_by_increasing_duration: function (itins)
    {
        itins.sort(this.compare_duration);
    }, // end of function sort_by_increasing_duration

    compare_in_duration_by_distance_from_median: function (median) // compare by distance from the median
    {
        return function(a, b)
        {
            var a_distance_from_median = Math.abs(a.durationMinutes - median);
            var b_distance_from_median = Math.abs(b.durationMinutes - median);

            if (a_distance_from_median > b_distance_from_median) return 1;
            else if (a_distance_from_median < b_distance_from_median) return -1;
            return 0;
        }
    }, // end of function compare_in_duration_by_distance_from_median

    median_in_duration: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_duration);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].durationMinutes;
        else
            return (itins_loc[center_index-1].durationMinutes + itins_loc[center_index].durationMinutes) / 2.0;
    }, // end of function median_in_duration

    median_absolute_deviation_in_duration: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var median_duration = this.median_in_duration(itins);

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_duration_by_distance_from_median(median_duration) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].durationMinutes - median_duration);
        else
            return ( Math.abs(itins_loc[center_index-1].durationMinutes - median_duration) +
                     Math.abs(itins_loc[center_index  ].durationMinutes - median_duration) ) / 2.0;
    }, // end of function median_absolute_deviation_in_duration

    compare_dep_rank: function (a, b)
    {
        if (a.best_dep_rank > b.best_dep_rank) return 1;
        else if (a.best_dep_rank < b.best_dep_rank) return -1;
        return 0;
    }, // end of function compare_dep_rank

    sort_by_increasing_dep_rank: function (itins)
    {
        itins.sort(this.compare_dep_rank);
    }, // end of function sort_by_increasing_dep_rank

    compare_in_dep_rank_by_distance_from_median: function (median) // compare by distance from the median
    {
        return function(a, b)
        {
            var a_distance_from_median = Math.abs(a.best_dep_rank - median);
            var b_distance_from_median = Math.abs(b.best_dep_rank - median);

            if (a_distance_from_median > b_distance_from_median) return 1;
            else if (a_distance_from_median < b_distance_from_median) return -1;
            return 0;
        }
    }, // end of function compare_in_dep_rank_by_distance_from_median

    median_in_dep_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_dep_rank);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].best_dep_rank;
        else
            return (itins_loc[center_index-1].best_dep_rank + itins_loc[center_index].best_dep_rank) / 2.0;
    }, // end of function median_in_dep_rank

    median_absolute_deviation_in_dep_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var median_dep_rank = this.median_in_dep_rank(itins);

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_dep_rank_by_distance_from_median(median_dep_rank) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].best_dep_rank - median_dep_rank);
        else
            return ( Math.abs(itins_loc[center_index-1].best_dep_rank - median_dep_rank) +
                     Math.abs(itins_loc[center_index  ].best_dep_rank - median_dep_rank) ) / 2.0;
    }, // end of function median_absolute_deviation_in_dep_rank

    compare_airl_rank: function (a, b)
    {
        if (a.best_airl_rank > b.best_airl_rank) return 1;
        else if (a.best_airl_rank < b.best_airl_rank) return -1;
        return 0;
    }, // end of function compare_airl_rank

    sort_by_increasing_airl_rank: function (itins)
    {
        itins.sort(this.compare_airl_rank);
    }, // end of function sort_by_increasing_airl_rank

    compare_in_airl_rank_by_distance_from_median: function (median) // compare by distance from the median
    {
        return function(a, b)
        {
            var a_distance_from_median = Math.abs(a.best_airl_rank - median);
            var b_distance_from_median = Math.abs(b.best_airl_rank - median);

            if (a_distance_from_median > b_distance_from_median) return 1;
            else if (a_distance_from_median < b_distance_from_median) return -1;
            return 0;
        }
    }, // end of function compare_in_airl_rank_by_distance_from_median

    median_in_airl_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_airl_rank);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].best_airl_rank;
        else
            return (itins_loc[center_index-1].best_airl_rank + itins_loc[center_index].best_airl_rank) / 2.0;
    }, // end of function median_in_airl_rank

    median_absolute_deviation_in_airl_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var median_airl_rank = this.median_in_airl_rank(itins);

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_airl_rank_by_distance_from_median(median_airl_rank) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].best_airl_rank - median_airl_rank);
        else
            return ( Math.abs(itins_loc[center_index-1].best_airl_rank - median_airl_rank) +
                     Math.abs(itins_loc[center_index  ].best_airl_rank - median_airl_rank) ) / 2.0;
    }, // end of function median_absolute_deviation_in_airl_rank

    compare_airl_rank2: function (a, b)
    {
        if (a.best_airl_rank2 > b.best_airl_rank2) return 1;
        else if (a.best_airl_rank2 < b.best_airl_rank2) return -1;
        return 0;
    }, // end of function compare_airl_rank2

    sort_by_increasing_airl_rank2: function (itins)
    {
        itins.sort(this.compare_airl_rank2);
    }, // end of function sort_by_increasing_airl_rank2

    compare_in_airl_rank2_by_distance_from_median: function (median) // compare by distance from the median
    {
        return function(a, b)
        {
            var a_distance_from_median = Math.abs(a.best_airl_rank2 - median);
            var b_distance_from_median = Math.abs(b.best_airl_rank2 - median);

            if (a_distance_from_median > b_distance_from_median) return 1;
            else if (a_distance_from_median < b_distance_from_median) return -1;
            return 0;
        }
    }, // end of function compare_in_airl_rank2_by_distance_from_median

    median_in_airl_rank2: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_airl_rank2);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].best_airl_rank2;
        else
            return (itins_loc[center_index-1].best_airl_rank2 + itins_loc[center_index].best_airl_rank2) / 2.0;
    }, // end of function median_in_airl_rank2

    median_absolute_deviation_in_airl_rank2: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        if (itins.length == 0) return undefined; // If empty, then median is not defined

        var median_airl_rank2 = this.median_in_airl_rank2(itins);

        var itins_loc = _.clone(itins,true) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_airl_rank2_by_distance_from_median(median_airl_rank2) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].best_airl_rank2 - median_airl_rank2);
        else
            return ( Math.abs(itins_loc[center_index-1].best_airl_rank2 - median_airl_rank2) +
                     Math.abs(itins_loc[center_index  ].best_airl_rank2 - median_airl_rank2) ) / 2.0;
    }, // end of function median_absolute_deviation_in_airl_rank2

    find_the_cheapest_itinerary: function (itins) // price is a string
    {
        var cheap_value = +itins[0].price; // convert string to float
        var cheap_index = 0;

        for(var i=1; i<itins.length; i++)
        {
            if (+itins[i].price < cheap_value) // convert string to float
            {
                cheap_index = i;
                cheap_value = +itins[i].price; // convert string to float
            }
        }

        return cheap_index;
    }, // end of function find_the_cheapest_itinerary

    find_the_shortest_itinerary: function (itins)
    {
        var short_value = itins[0].durationMinutes;
        var short_index = 0;

        for(var i=1; i<itins.length; i++)
        {
            if (itins[i].durationMinutes < short_value)
            {
                short_index = i;
                short_value = itins[i].durationMinutes;
            }
        }

        return short_index;
    }, // end of function find_the_shortest_itinerary

    compare_in_2D_first_by_price_then_by_duration: function (a, b) // price is a string
    {
        var a_price = +a.price; // convert string to float
        var b_price = +b.price; // convert string to float
        if (a_price > b_price) return 1;
        else if (a_price < b_price) return -1;
        else if (a.durationMinutes > b.durationMinutes) return 1;
        else if (a.durationMinutes < b.durationMinutes) return -1;
        return 0;
    }, // end of function compare_in_2D_first_by_price_then_by_duration

    sort_in_2D_first_by_increasing_price_then_by_increasing_duration: function (itins)
    {
        itins.sort(this.compare_in_2D_first_by_price_then_by_duration);
    }, // end of function sort_in_2D_first_by_increasing_price_then_by_increasing_duration

    is_different_price_from_previous: function (element, index, array)
    {
        if (index==0) return true;
        else if (+element.price != +array[index-1].price) return true;
        return false;
    }, // end of function is_different_price_from_previous

    is_shorter_but_more_expensive_than_previous: function (element, index, array)
    {
        //arguments.callee.previous_good_itin_index is a static variable, stored within this function

        if (index==0)
            { arguments.callee.previous_good_itin_index = index; return true; }
        else if ( +element.price > +array[arguments.callee.previous_good_itin_index].price &&
                   element.durationMinutes < array[arguments.callee.previous_good_itin_index].durationMinutes)
            { arguments.callee.previous_good_itin_index = index; return true; }
        return false;
    }, // end of function is_shorter_but_more_expensive_than_previous

    prune_itineraries_in_2D: function (itins)
    {
        if (itins.length == 0) return itins; // If empty, then nothing to prune

        // Find the index of the cheapest itinerary
        var cheapest_idx = this.find_the_cheapest_itinerary(itins);
        var cheapest_duration =  itins[cheapest_idx].durationMinutes;

        // Find the index of the shortest itinerary
        var shortest_idx = this.find_the_shortest_itinerary(itins);
        var shortest_price    = +itins[shortest_idx].price; // convert string to float

        return itins.filter( function(it){return(+it.price<=shortest_price)} )             // only keep the ones with +price <= shortest_price
                    .filter( function(it){return(it.durationMinutes<=cheapest_duration)} ) // only keep the ones with duration <= cheapest_duration
                    .sort(this.compare_in_2D_first_by_price_then_by_duration)              // sort by price and then by duration
                    .filter(this.is_shorter_but_more_expensive_than_previous)              // only keep the ones that are shorter and more expensive than the previous kept one
                    ;
    }, // end of function prune_itineraries_in_2D

    compare_in_2D_by_linear_combination: function (price_pref,duration_pref) // compare in 2D by linear combination of price and duration
    // if price_preference < duration_preference, then low price is more important than low duration
    // if price_preference > duration_preference, then low duration is more important than low price
    {
        return function(a, b)
        {
            var a_linear_combination = duration_pref*(+a.price) + price_pref*a.durationMinutes; // convert price from string to float
            var b_linear_combination = duration_pref*(+b.price) + price_pref*b.durationMinutes; // convert price from string to float

            if (a_linear_combination > b_linear_combination) return 1;
            else if (a_linear_combination < b_linear_combination) return -1;
            return 0;
        };
    }, // end of function compare_in_2D_by_linear_combination

    compare_in_3D_by_linear_combination: function (price_pref, duration_pref, departure_pref) // compare in 3D by linear combination of price, duration, and departure
    // if price_preference < duration_preference, then low price is more important than low duration
    // if price_preference > duration_preference, then low duration is more important than low price
    {
        return function(a, b)
        {
            if(price_pref     == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(duration_pref  == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(departure_pref == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero

            var a_linear_combination = (+a.price)/price_pref + a.durationMinutes/duration_pref + a.best_dep_rank/departure_pref; // convert price from string to float
            var b_linear_combination = (+b.price)/price_pref + b.durationMinutes/duration_pref + b.best_dep_rank/departure_pref; // convert price from string to float

            if (a_linear_combination > b_linear_combination) return 1;
            else if (a_linear_combination < b_linear_combination) return -1;
            return 0;
        };
    }, // end of function compare_in_3D_by_linear_combination

    compare_in_3D_by_linear_combination_of_price_duration_airline2: function (price_pref, duration_pref, airline_pref) // compare in 3D by linear combination of price, duration, and departure
    // if price_preference < duration_preference, then low price is more important than low duration
    // if price_preference > duration_preference, then low duration is more important than low price
    {
        return function(a, b)
        {
            if(price_pref     == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(duration_pref  == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(airline_pref   == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero

            var a_linear_combination = a.priceRank/price_pref + a.durationMinutes/duration_pref + a.best_airl_rank2/airline_pref;
            var b_linear_combination = b.priceRank/price_pref + b.durationMinutes/duration_pref + b.best_airl_rank2/airline_pref;

            if (a_linear_combination > b_linear_combination) return 1;
            else if (a_linear_combination < b_linear_combination) return -1;
            return 0;
        };
    }, // end of function compare_in_3D_by_linear_combination_of_price_duration_airline2

    compare_in_4D_by_linear_combination: function (price_pref, duration_pref, departure_pref, airline_pref) // compare in 2D by linear combination of price, duration, departure, and airline
    // if price_preference < duration_preference, then low price is more important than low duration
    // if price_preference > duration_preference, then low duration is more important than low price
    {
        return function(a, b)
        {
            if(price_pref     == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(duration_pref  == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(departure_pref == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero
            if(airline_pref   == 0.0) { return 0; } // ERROR: the function is undefinded when one of the preferences is zero

            var a_linear_combination = (+a.price)/price_pref + a.durationMinutes/duration_pref + a.best_dep_rank/departure_pref + a.best_airl_rank/airline_pref; // convert price from string to float
            var b_linear_combination = (+b.price)/price_pref + b.durationMinutes/duration_pref + b.best_dep_rank/departure_pref + b.best_airl_rank/airline_pref; // convert price from string to float

            if (a_linear_combination > b_linear_combination) return 1;
            else if (a_linear_combination < b_linear_combination) return -1;
            return 0;
        };
    }, // end of function compare_in_4D_by_linear_combination

    rank_itineraries_in_2D: function (itins, price_preference, duration_preference)
    // price_preference and duration_preference can be positive, negative, or zero, but can't both be zero at the same time.
    // positive number means that lower values are preferred.
    // negative number means that higher values are preferred.
    {
        if (itins.length == 0) return itins; // If empty, then nothing to rank
        if (itins.length == 1) return itins; // If just one itinerary, then nothing to rank

        // if price_preference < duration_preference, then low price is more important than low duration
        if(price_preference    === undefined) { price_preference    = 1.0; } // default value is 1
        if(duration_preference === undefined) { duration_preference = 1.0; } // default value is 1

        if ( price_preference==0 && duration_preference==0) return itins;

        var Median_price    = this.median_in_price     (itins) + 1; //onvoya.log.info("Median_price = "    + Median_price);
        var Median_duration = this.median_in_duration  (itins) + 1; //onvoya.log.info("Median_duration = " + Median_duration);

        return _.clone(itins,true) // make a copy
                .sort(this.compare_in_2D_by_linear_combination(price_preference/Median_duration,duration_preference/Median_price) ); // sort in 2D by linear combination of price and duration
    }, // end of function rank_itineraries_in_2D

    find_closest_array_index: function (a, start_idx, end_idx, x)
    // a -- array
    // x -- number
    {
        if (start_idx >  end_idx) return -1; // if empty, return NaN // TO DO: deal with NaNs
        if (start_idx == end_idx) return start_idx; // if single element, return this element
        if (x <= a[start_idx]) return start_idx; // if x is smaller than anything, then return the first element
        if (x >= a[end_idx  ]) return end_idx  ; // if x is greater than anything, then return the last element

        var low_idx = start_idx;
        var high_idx = end_idx;

        while (low_idx < high_idx)
        {
            if ( high_idx - low_idx==1 ) // if just 2 neighboring elements left and x is between them
            {
                var dist_low  = Math.abs(a[low_idx ] - x);
                var dist_high = Math.abs(a[high_idx] - x);
                if (dist_low < dist_high) { return low_idx; } else { return high_idx; }; // return the one that is closer to x
            }

            var mid_idx = Math.floor( (low_idx + high_idx) / 2.0 ); // split in half
            if (x == a[mid_idx]) { return mid_idx; };
            if (x <  a[mid_idx]) { high_idx = mid_idx; }; // look at left part
            if (x >  a[mid_idx]) { low_idx  = mid_idx; }; // look at right part
        }
    }, // end of function find_closest_array_index

    order_by_diversity: function (data, axis_start, axis_end) // data --- array of numbers
    // output is the array of integer indices [i1 i2 ... iN], such that data[i1] is better than data[i2], which is better than data[i3], ..., which is better than data[iN]
    // TODO: do we need to assign the same rank to itineraries with the same  values?
    {
        if (data.length == 0) return []; // If empty, then nothing to do
        if (data.length == 1) return [0]; // If one element, then nothing to do
        if (data.length == 2) return [0,1]; // If two elements, then nothing to do

        //onvoya.log.info("data length = " + data.length);

        var data_loc = _.clone(data,true) // make a copy
                        .sort(function(a, b){return a-b});

        //onvoya.log.info("data_loc length = "+ data_loc.length);

        if (axis_start > data[0] ) return data; // ERROR: the interval [axis_start,axis_end] does not contain all the data
        if (axis_end   < data[data.length-1] ) return data; // ERROR: the interval [axis_start,axis_end] does not contain all the data

        // we now have axis_start, all the ordered data, axis_end in this order

        var result = []; // TO DO: preallocate for speed

        var queue = []; // create an empty queue

        queue.push({
                        interval_begin: axis_start,
                        interval_end  : axis_end,
                        index_begin: 0,
                        index_end  : data.length-1,
                        ratio: 0.5
                  });

        var iter = 0;

        do
        {
            iter++;

            //if (iter > 1000) break;

            // TO DO: do not sort, just find the longest interval
            queue.sort(function(a, b){return (b.interval_end - b.interval_begin) - (a.interval_end - a.interval_begin) }); // sort the queue in decreasing order of interval sizes

            var current = queue.shift(); // extract the first element from the queue

            var current_center = current.interval_end * current.ratio + current.interval_begin * (1.0-current.ratio);

            var closest_idx =  this.find_closest_array_index(data_loc, current.index_begin, current.index_end, current_center);

            if ( closest_idx >= 0 ) // if something is found
            {
                result.push(closest_idx); // the index of the best diversity element in a sorted array

                queue.push({
                                interval_begin: current.interval_begin,
                                interval_end  : data_loc[closest_idx],
                                index_begin: current.index_begin,
                                index_end  : closest_idx-1,
                                //ratio: 0.5
                                ratio: ( current.interval_begin==axis_start ? 0.333 : 0.5 )
                          });

                queue.push({
                                interval_begin: data_loc[closest_idx],
                                interval_end  : current.interval_end,
                                index_begin: closest_idx+1,
                                index_end  : current.index_end,
                                //ratio: 0.5
                                ratio: ( current.interval_end==axis_end ? 0.667 : 0.5 )
                          });
            }
        }
        while (0 !== queue.length)

        return result;
    }, // end of function order_by_diversity

    order_by_increasing_values: function (toSort)
    // output is the sorted array toSort, where toSort.sortIndices are the integer indices [i1 i2 ... iN], such that toSort[i1] <= toSort[i2] <= ... <= toSort[iN]
    {
        for (var i = 0; i < toSort.length; i++)
        {
            toSort[i] = [toSort[i], i];
        }
        toSort.sort(function(left, right) { return left[0] < right[0] ? -1 : 1; });
        toSort.sortIndices = [];
        for (var j = 0; j < toSort.length; j++)
        {
            toSort.sortIndices.push(toSort[j][1]);
            toSort[j] = toSort[j][0];
        }
        return toSort;
    }, // end of function order_by_increasing_values

    prune_itineraries_in_3D: function (itins)
    {
        var light_output = false;
        var heavy_output = false;

        if (itins.length == 0) return itins; // If empty, then nothing to prune
        if (itins.length == 1) return itins; // If just one itinerary, then nothing to prune

        if (light_output) onvoya.log.info("================  Output from prune_itineraries_in_3D(..)  ================");

        // Find the index of the cheapest itinerary
        var cheapest_idx = this.find_the_cheapest_itinerary(itins);

        // Find the index of the shortest itinerary
        var shortest_idx = this.find_the_shortest_itinerary(itins);

        // Find the index of the best departure itinerary
        array_of_departures = itins.map(function(it){return it.depatureMinutes}); // extract all the departure values into a separate array
        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, in the original order (length "+array_of_departures.length+") :");
            onvoya.log.info(array_of_departures);
        }
        array_of_departures = this.order_by_increasing_values(array_of_departures); // sort while saving permutation indices
        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, sorted, permutation indices saved (length "+array_of_departures.length+", sortIndices length "+array_of_departures.sortIndices.length+") :");
            onvoya.log.info(array_of_departures);
        }
        preferred_departures_indices = this.order_by_diversity(array_of_departures, 0, 24*60); // order by diversity
        if (light_output)
        {
            onvoya.log.info("Indices of the best departures, ordered by diversity (length "+preferred_departures_indices.length+"):");
            onvoya.log.info(preferred_departures_indices);
        }
        var best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[0]];

        // append the departure ranking information to itineraries: the smaller best_dep_rank is, the better the itinerary is
        for(var i=0; i<array_of_departures.length; i++) { itins[array_of_departures.sortIndices[preferred_departures_indices[i]]].best_dep_rank = i; };

        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, sorted by departure preference :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = array_of_departures[preferred_departures_indices[i]]; }; onvoya.log.info(temp);
            onvoya.log.info("Indices of the above departures into the original itinerary array :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = preferred_departures_indices[i]; }; onvoya.log.info(temp);
            onvoya.log.info();
        }

        if (light_output)
        {
            onvoya.log.info(this.one_itin_to_string("The cheapest itinerary is # " + cheapest_idx + " of " + itins.length + " : ", itins[cheapest_idx]));
            onvoya.log.info(this.one_itin_to_string("The shortest itinerary is # " + shortest_idx + " of " + itins.length + " : ", itins[shortest_idx]));
            onvoya.log.info(this.one_itin_to_string("The best-departure itinerary is # " + best_dep_idx + " of " + itins.length + " : ", itins[best_dep_idx]));
            var next_best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[1]];
            onvoya.log.info(this.one_itin_to_string("The next best-departure itinerary is # " + next_best_dep_idx + " of " + itins.length + " : ", itins[next_best_dep_idx]));
            onvoya.log.info();
        }

        var cheapest_price     = +itins[cheapest_idx].price; // convert string to float // not needed
        var cheapest_duration  =  itins[cheapest_idx].durationMinutes; // needed later for filtering
        var cheapest_departure =  itins[cheapest_idx].depatureMinutes; // not needed
        var cheapest_dep_rank  =  itins[cheapest_idx].best_dep_rank; // needed later for filtering

        var shortest_price     = +itins[shortest_idx].price; // convert string to float // needed later for filtering
        var shortest_duration  =  itins[shortest_idx].durationMinutes; // not needed
        var shortest_departure =  itins[shortest_idx].depatureMinutes; // not needed
        var shortest_dep_rank  =  itins[shortest_idx].best_dep_rank; // needed later for filtering

        var best_dep_price     = +itins[best_dep_idx].price; // convert string to float
        var best_dep_duration  =  itins[best_dep_idx].durationMinutes; // needed later for filtering
        var best_dep_departure =  itins[best_dep_idx].depatureMinutes; // not needed
        var best_dep_dep_rank  =  itins[best_dep_idx].best_dep_rank; // should be zero // not needed

        var loc_itins = _.clone(itins,true) // make a copy
                         .filter( function(it){return(it.durationMinutes<=cheapest_duration || it.best_dep_rank<=cheapest_dep_rank )} )  // only keep the ones with duration < cheapest duration or dep better than the cheapest departure
                         .filter( function(it){return(+it.price<=shortest_price || it.best_dep_rank<=shortest_dep_rank )} )              // only keep the ones with price < shortest price or dep better than the shortest departure
                         .filter( function(it){return(it.durationMinutes<=best_dep_duration || +it.price<=best_dep_price )} );           // only keep the ones with duration < best departure duration or price < best departure price

        // At this point three worst octants have been removed. These octants are attached to the cheapest, shortest, and best_dep itineraries

        if (light_output)
        {
            onvoya.log.info("3D-semipruned itineraries :");
            this.print_many_itineraries(loc_itins);
            onvoya.log.info();
        }

        // Now we need to finish the pruning by examining itineraries pairwise and removing the ones that are guaranteed worse in all dimensions (in all attributes) in 3D

        for(var i=0; i<loc_itins.length; i++)
        {
            if (heavy_output)
            {
                var temp_to_remove = _.clone(loc_itins,true) // make a copy
                                      .filter( function(it){return( ( +it.price >= +loc_itins[i].price ) && ( it.durationMinutes >= loc_itins[i].durationMinutes ) && ( it.best_dep_rank > loc_itins[i].best_dep_rank ) )} );

                if (temp_to_remove.length>0)
                {
                    if (temp_to_remove.length==1)
                    {
                        onvoya.log.info(this.one_itin_to_string("Itinerary : ", temp_to_remove[0]));
                        onvoya.log.info("is removed because it is worse than");
                    }
                    else
                    {
                        onvoya.log.info("Itineraries :");
                        this.print_many_itineraries(temp_to_remove);
                        onvoya.log.info("are removed because they are worse than");
                    }

                    onvoya.log.info(this.one_itin_to_string("Itinerary : ", loc_itins[i]));
                    onvoya.log.info();
                }
            }

            // filter (keep) only the itineraries with (price < current itin price) or (duration < current itin duration) or (dep_rank < current itin dep_rank)
            loc_itins = loc_itins.filter( function(it){return( ( +it.price < +loc_itins[i].price ) || ( it.durationMinutes < loc_itins[i].durationMinutes ) || ( it.best_dep_rank <= loc_itins[i].best_dep_rank ) )} );
            // make sure to not filter out the current itinerary
            // we are safe here since best_dep_rank is never equal in two different itineraries
            // otherwise we had to add it back after filtering out
        }

        // At this point pair-wise comperisons have been performed and clearly worse itineraries have been removed

        if (light_output)
        {
            onvoya.log.info("3D-fully-pruned itineraries :");
            this.print_many_itineraries(loc_itins);
            onvoya.log.info("===========================================================================");
            onvoya.log.info();
        }

        return loc_itins;
    }, // end of function prune_itineraries_in_3D

    rank_itineraries_in_3D: function (itins, price_preference, duration_preference, departure_preference)
    {
        if (itins.length == 0) return itins; // If empty, then nothing to rank
        if (itins.length == 1) return itins; // If just one itinerary, then nothing to rank

        // if price_preference < duration_preference, then low price is more important than low duration
        if ( price_preference     === undefined ) { price_preference     = 1.0; } // default value is 1
        if ( duration_preference  === undefined ) { duration_preference  = 1.0; } // default value is 1
        if ( departure_preference === undefined ) { departure_preference = 1.0; } // default value is 1

        if ( price_preference     == 0 ) return itins;
        if ( duration_preference  == 0 ) return itins;
        if ( departure_preference == 0 ) return itins;

        var MAD_price    = this.median_absolute_deviation_in_price   (itins);
        var MAD_duration = this.median_absolute_deviation_in_duration(itins);
        var MAD_dep_rank = this.median_absolute_deviation_in_dep_rank(itins);

        return _.clone(itins,true) // make a copy
                .sort( this.compare_in_3D_by_linear_combination(price_preference*MAD_price,duration_preference*MAD_duration,departure_preference*MAD_dep_rank) ); // sort in 3D by linear combination of price, duration, and dep_rank
    }, // end of function rank_itineraries_in_3D

    prune_itineraries_in_4D: function (itins)
    {
        var light_output = false;
        var heavy_output = false;

        if (itins.length == 0) return itins; // If empty, then nothing to prune
        if (itins.length == 1) return itins; // If just one itinerary, then nothing to prune

        if (light_output) onvoya.log.info("================  Output from prune_itineraries_in_4D(..)  ================");

        // Find the index of the cheapest itinerary
        var cheapest_idx = this.find_the_cheapest_itinerary(itins);

        // Find the index of the shortest itinerary
        var shortest_idx = this.find_the_shortest_itinerary(itins);

        // Find the index of the best departure itinerary
        array_of_departures = itins.map(function(it){return it.depatureMinutes}); // extract all the departure values into a separate array
        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, in the original order (length "+array_of_departures.length+") :");
            onvoya.log.info(array_of_departures);
        }
        array_of_departures = this.order_by_increasing_values(array_of_departures); // sort while saving permutation indices
        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, sorted, permutation indices saved (length "+array_of_departures.length+", sortIndices length "+array_of_departures.sortIndices.length+") :");
            onvoya.log.info(array_of_departures);
        }
        preferred_departures_indices = this.order_by_diversity(array_of_departures, 0, 24*60); // order by diversity
        if (light_output)
        {
            onvoya.log.info("Indices of the best departures, ordered by diversity (length "+preferred_departures_indices.length+"):");
            onvoya.log.info(preferred_departures_indices);
        }
        var best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[0]];

        //onvoya.log.info("best_dep_idx = " + best_dep_idx);
        //onvoya.log.info("i is changing from 0 to < " + array_of_departures.length);
        //onvoya.log.info("preferred_departures_indices (length " + preferred_departures_indices.length + ") =");
        //onvoya.log.info(preferred_departures_indices);
        //onvoya.log.info("array_of_departures.sortIndices (length " + array_of_departures.sortIndices.length + ") =");
        //onvoya.log.info(array_of_departures.sortIndices);
        //onvoya.log.info("itins length is " + itins.length);

        // append the departure ranking information to itineraries: the smaller best_dep_rank is, the better the itinerary is
        for(var i=0; i<array_of_departures.length; i++)
        {
            //onvoya.log.info("i = " + i + ", pdi = " + preferred_departures_indices[i] + " aod.sI = " + array_of_departures.sortIndices[preferred_departures_indices[i]]);
            itins[array_of_departures.sortIndices[preferred_departures_indices[i]]].best_dep_rank = i;
        };

        if (light_output)
        {
            onvoya.log.info("Decoded departures in minutes, sorted by departure preference :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = array_of_departures[preferred_departures_indices[i]]; }; onvoya.log.info(temp);
            onvoya.log.info("Indices of the above departures into the original itinerary array :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = preferred_departures_indices[i]; }; onvoya.log.info(temp);
            onvoya.log.info();
        }

        // Find the index of the best airline itinerary
        var preferred_airline_indices = this.determine_airline_preferences(itins);
        var best_airl_idx = preferred_airline_indices[0];

        // append the airline ranking information to itineraries: the smaller best_airl_rank is, the better the itinerary is
        for(var i=0; i<preferred_airline_indices.length; i++) { itins[preferred_airline_indices[i]].best_airl_rank = i; };

        if (light_output)
        {
            onvoya.log.info(this.one_itin_to_string("The cheapest itinerary is # " + cheapest_idx + " of " + itins.length + " : ", itins[cheapest_idx]));
            onvoya.log.info(this.one_itin_to_string("The shortest itinerary is # " + shortest_idx + " of " + itins.length + " : ", itins[shortest_idx]));
            onvoya.log.info(this.one_itin_to_string("The best-departure itinerary is # " + best_dep_idx + " of " + itins.length + " : ", itins[best_dep_idx]));
            var next_best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[1]];
            onvoya.log.info(this.one_itin_to_string("The next best-departure itinerary is # " + next_best_dep_idx + " of " + itins.length + " : ", itins[next_best_dep_idx]));
            onvoya.log.info(this.one_itin_to_string("The best-airline itinerary is # " + best_airl_idx + " of " + itins.length + " : ", itins[best_airl_idx]));
            var next_best_airl_idx = preferred_airline_indices[1];
            onvoya.log.info(this.one_itin_to_string("The next best-airline itinerary is # " + next_best_airl_idx + " of " + itins.length + " : ", itins[next_best_airl_idx]));
            onvoya.log.info();
        }

        var cheapest_price     = +itins[cheapest_idx].price; // convert string to float // not needed
        var cheapest_duration  =  itins[cheapest_idx].durationMinutes; // needed later for filtering
        var cheapest_departure =  itins[cheapest_idx].depatureMinutes; // not needed
        var cheapest_dep_rank  =  itins[cheapest_idx].best_dep_rank; // needed later for filtering
        var cheapest_air_line  =  itins[cheapest_idx].air_line; // not needed
        var cheapest_airl_rank =  itins[cheapest_idx].best_airl_rank; // needed later for filtering

        var shortest_price     = +itins[shortest_idx].price; // convert string to float // needed later for filtering
        var shortest_duration  =  itins[shortest_idx].durationMinutes; // not needed
        var shortest_departure =  itins[shortest_idx].depatureMinutes; // not needed
        var shortest_dep_rank  =  itins[shortest_idx].best_dep_rank; // needed later for filtering
        var shortest_air_line  =  itins[shortest_idx].air_line; // not needed
        var shortest_airl_rank =  itins[shortest_idx].best_airl_rank; // needed later for filtering

        var best_dep_price     = +itins[best_dep_idx].price; // convert string to float
        var best_dep_duration  =  itins[best_dep_idx].durationMinutes; // needed later for filtering
        var best_dep_departure =  itins[best_dep_idx].depatureMinutes; // not needed
        var best_dep_dep_rank  =  itins[best_dep_idx].best_dep_rank; // should be zero // not needed
        var best_dep_air_line  =  itins[best_dep_idx].air_line; // not needed
        var best_dep_airl_rank =  itins[best_dep_idx].best_airl_rank; // needed later for filtering

        var best_airl_price     = +itins[best_airl_idx].price; // convert string to float
        var best_airl_duration  =  itins[best_airl_idx].durationMinutes; // needed later for filtering
        var best_airl_departure =  itins[best_airl_idx].depatureMinutes; // not needed
        var best_airl_dep_rank  =  itins[best_airl_idx].best_dep_rank; // should be zero // not needed
        var best_airl_air_line  =  itins[best_airl_idx].air_line; // not needed
        var best_airl_airl_rank =  itins[best_airl_idx].best_airl_rank; // needed later for filtering

        var loc_itins = _.clone(itins,true) // make a copy
                         .filter( function(it){return(it.durationMinutes<=cheapest_duration || it.best_dep_rank<=cheapest_dep_rank || it.best_airl_rank<=cheapest_airl_rank )} )  // only keep the ones with duration < cheapest duration, or dep better than the cheapest departure, or airline better than the cheapest airline
                         .filter( function(it){return(+it.price<=shortest_price || it.best_dep_rank<=shortest_dep_rank || it.best_airl_rank<=shortest_airl_rank )} )              // only keep the ones with price < shortest price, or dep better than the shortest departure, or airline better than the shortest airline
                         .filter( function(it){return(it.durationMinutes<=best_dep_duration || +it.price<=best_dep_price || it.best_airl_rank<=best_dep_airl_rank )} )            // only keep the ones with duration < best departure duration, or price < best departure price, or airline better than the best departure airline
                         .filter( function(it){return(it.durationMinutes<=best_airl_duration || +it.price<=best_airl_price || it.best_dep_rank<=best_airl_dep_rank )} );          // only keep the ones with duration < best airline duration, or price < best airline price, or departure better than the best airline airline

        // At this point three worst octants have been removed. These octants are attached to the cheapest, shortest, and best_dep itineraries

        if (light_output)
        {
            onvoya.log.info("4D-semipruned itineraries :");
            this.print_many_itineraries(loc_itins);
            onvoya.log.info();
        }

        // Now we need to finish the pruning by examining itineraries pairwise and removing the ones that are guaranteed worse in all dimensions (in all attributes) in 3D

        for(var i=0; i<loc_itins.length; i++)
        {
            if (heavy_output)
            {
                var temp_to_remove = _.clone(loc_itins,true) // make a copy
                                      .filter( function(it){return( ( +it.price >= +loc_itins[i].price ) && ( it.durationMinutes >= loc_itins[i].durationMinutes ) && ( it.best_dep_rank > loc_itins[i].best_dep_rank ) && ( it.best_airl_rank > loc_itins[i].best_airl_rank ) )} );

                if (temp_to_remove.length>0)
                {
                    if (temp_to_remove.length==1)
                    {
                        onvoya.log.info(this.one_itin_to_string("Itinerary : ", temp_to_remove[0]));
                        onvoya.log.info("is removed because it is worse than");
                    }
                    else
                    {
                        onvoya.log.info("Itineraries :");
                        this.print_many_itineraries(temp_to_remove);
                        onvoya.log.info("are removed because they are worse than");
                    }

                    onvoya.log.info(this.one_itin_to_string("Itinerary : ", loc_itins[i]));
                    onvoya.log.info();
                }
            }

            // filter (keep) only the itineraries with (price < current itin price) or (duration < current itin duration) or (dep_rank < current itin dep_rank) or (airl_rank < current itin airl_rank)
            loc_itins = loc_itins.filter( function(it){return( ( +it.price < +loc_itins[i].price ) || ( it.durationMinutes < loc_itins[i].durationMinutes ) || ( it.best_dep_rank <= loc_itins[i].best_dep_rank ) || ( it.best_airl_rank <= loc_itins[i].best_airl_rank ) )} );
            // make sure to not filter out the current itinerary
            // we are safe here since best_dep_rank is never equal in two different itineraries
            // otherwise we had to add it back after filtering out
        }

        // At this point pair-wise comparisons have been performed and clearly worse itineraries have been removed

        if (light_output)
        {
            onvoya.log.info("4D-fully-pruned itineraries :");
            this.print_many_itineraries(loc_itins);
            onvoya.log.info("===========================================================================");
            onvoya.log.info();
        }

        return loc_itins;
    }, // end of function prune_itineraries_in_4D

    rank_itineraries_in_4D: function (itins, price_preference, duration_preference, departure_preference, airline_preference)
    {
        if (itins.length == 0) return itins; // If empty, then nothing to rank
        if (itins.length == 1) return itins; // If just one itinerary, then nothing to rank

        // if price_preference < duration_preference, then low price is more important than low duration
        if ( price_preference     === undefined ) { price_preference     = 1.0; } // default value is 1
        if ( duration_preference  === undefined ) { duration_preference  = 1.0; } // default value is 1
        if ( departure_preference === undefined ) { departure_preference = 1.0; } // default value is 1
        if ( airline_preference   === undefined ) { airline_preference   = 1.0; } // default value is 1

        onvoya.log.info("Ranking based on the following preferences: price " + price_preference + ", duration " + duration_preference + ", departure " + departure_preference + ", airline " + airline_preference);

        if ( (price_preference==0) || (duration_preference==0) || (departure_preference==0) || (airline_preference==0) )
        {
            price_preference     += 0.1;
            duration_preference  += 0.1;
            departure_preference += 0.1;
            airline_preference   += 0.1;
        }

        //onvoya.log.info("Ranking base on the following preferences: price " + price_preference + ", duration " + duration_preference + ", departure " + departure_preference + ", airline " + airline_preference);

        var MAD_price     = this.median_absolute_deviation_in_price    (itins);
        var MAD_duration  = this.median_absolute_deviation_in_duration (itins);
        var MAD_dep_rank  = this.median_absolute_deviation_in_dep_rank (itins);
        var MAD_airl_rank = this.median_absolute_deviation_in_airl_rank(itins);
        return _.clone(itins,true) // make a copy
                .sort( this.compare_in_4D_by_linear_combination(price_preference    *MAD_price    ,
                                                                duration_preference *MAD_duration ,
                                                                departure_preference*MAD_dep_rank ,
                                                                airline_preference  *MAD_airl_rank) ); // sort in 4D by linear combination of price, duration, dep_rank, and airl_rank
    }, // end of function rank_itineraries_in_4D

    is_in_array: function (array, element)
    {
        return array.indexOf(element) >= 0;
    }, // end of function is_in_array

    sort_by_preferred_airlines: function (itins, preferred_airlines)
    // Sorting by price, taking into account $100 price discount for preferred_airlines.
    // The airlines, specified in the array preferred_airlines are given a price advantage of $100, when sorting by price.
    {
        var loc_itins = _.clone(itins,true); // make a copy

        //var preferred_airline_price_advantage = 100.00;
        var preferred_airline_price_advantage = this.median_in_price(loc_itins)*0.1; // 10% of the median price

        onvoya.log.info("Ranking based on the price advantage of $" + preferred_airline_price_advantage + " for the following airlines: " + preferred_airlines);

        if (preferred_airlines.length == 0) return loc_itins;

        for(var i=0; i<loc_itins.length; i++)
            if (!this.is_in_array(preferred_airlines,loc_itins[i].air_line) )
                loc_itins[i].price = (Number(loc_itins[i].price) + preferred_airline_price_advantage).toString();

        this.sort_by_increasing_price(loc_itins);

        for(var i=0; i<loc_itins.length; i++)
            if (!this.is_in_array(preferred_airlines,loc_itins[i].air_line) )
                loc_itins[i].price = (Number(loc_itins[i].price) - preferred_airline_price_advantage).toString();

        return loc_itins;
    }, // end of function sort_by_preferred_airlines

    append_1D_airline_rank2: function (itins, preferred_airlines, price_pref, duration_pref)
    {
        if (itins.length == 0) return itins; // If empty, then nothing to do
        if (itins.length == 1) { itins[0].airlineRank = 1; return itins;} // If just one element, then just assign rank 1 to it

        // extract all the itinerary IDs into a separate array
        var ID = itins.map( function (it) { return it.id } );

        // appends air_line field if needed
        if ( !itins[0].hasOwnProperty('air_line') ) this.determine_airline(itins);

        // assume that preferred_airlines is an array of unique IATA-2 airline codes
        preferred_airlines = _.uniq(preferred_airlines); // keeps one copy of each airline

        // compute the other airlines
        var other_airlines = itins.map(function(it){return it.air_line}); // extract all the airlines into a separate array
        other_airlines = _.uniq(other_airlines); // keeps one copy of each airline
        other_airlines = _.difference(other_airlines,preferred_airlines); // remove the preferred airlines

        //onvoya.log.info("Preferred airlines :");
        //onvoya.log.info(preferred_airlines);
        //onvoya.log.info("Other airlines :");
        //onvoya.log.info(other_airlines);

        var self = this; // needed as a workaround to use this in no-name functions
        var itins_preferred = _.clone(itins,true) // make a copy
                               .filter( function(it){return( self.is_in_array(preferred_airlines,it.air_line) )} ); // on preferred airlines

        var itins_other = _.clone(itins,true) // make a copy
                           .filter( function(it){return(!self.is_in_array(preferred_airlines,it.air_line))} ); // on other airlines

        // prune and rank itins for each preferred airline individually
        //onvoya.log.info("The whole set of preferred itins before ranking :");
        //this.print_many_itineraries(itins_preferred);
        var itins_on_airline = [];
        var number_of_itins_on_airline = [];
        for(var i=0; i<preferred_airlines.length; i++)
        {
            var itins_from_one_airline = _.clone(itins_preferred,true) // make a copy
                                          .filter( function(it){return(it.air_line==preferred_airlines[i])} ); // one of the preferred airlines
            number_of_itins_on_airline[preferred_airlines[i]] = itins_from_one_airline.length;

            var pruned_itins_from_one_airline = this.prune_itineraries_in_2D(itins_from_one_airline); // pruned
            var ranked_itins_from_one_airline = this.rank_itineraries_in_2D(pruned_itins_from_one_airline, price_pref, duration_pref); // ranked
            var other__itins_from_one_airline = itins_from_one_airline.filter(function(obj){ // the rest
                                                    return !ranked_itins_from_one_airline.some(function(obj2) { return obj.id == obj2.id; });
                                                });
            other__itins_from_one_airline = this.rank_itineraries_in_2D(other__itins_from_one_airline, price_pref, duration_pref); // ranked in-place

            itins_on_airline[preferred_airlines[i]] = ranked_itins_from_one_airline.concat(other__itins_from_one_airline); // pruned-out appended at the end

            //onvoya.log.info("Preferred itins on airline " + preferred_airlines[i] + " after ranking (" + number_of_itins_on_airline[preferred_airlines[i]] + " total) :");
            //this.print_many_itineraries(itins_on_airline[preferred_airlines[i]]);
        }
        //onvoya.log.info("Number of itins per preferred airline :");
        //onvoya.log.info(number_of_itins_on_airline);

        // prune and rank itins for each remaining airline together
        //onvoya.log.info("Other itins before ranking :");
        //this.print_many_itineraries(itins_other);
        var pruned_itins_other = this.prune_itineraries_in_2D(itins_other); // pruned
        var ranked_itins_other = this.rank_itineraries_in_2D(pruned_itins_other, price_pref, duration_pref); // ranked
        var other__itins_other = itins_other.filter(function(obj){ // the rest
                                      return !ranked_itins_other.some(function(obj2) { return obj.id == obj2.id; });
                                 });
        other__itins_other = this.rank_itineraries_in_2D(other__itins_other, price_pref, duration_pref); // ranked in-place
        itins_other = ranked_itins_other.concat(other__itins_other); // pruned-out appended at the end
        //onvoya.log.info("Other itins after ranking :");
        //this.print_many_itineraries(itins_other);

        // mix together the itins from preferred airlines, assign the airline_rank2
        var cur_rank = 0;
        while ( cur_rank != itins_preferred.length )
        {
            for (var airline in number_of_itins_on_airline) { if (number_of_itins_on_airline[airline] != 0) break; }; // find the airline with available itins
            var take_the_airline = airline;
            var number_of_untaken_itins = itins_on_airline[airline].length;
            var ratio_of_untaken_itins = number_of_untaken_itins/number_of_itins_on_airline[airline];

            for (var airline in itins_on_airline)
            {
                var cur_number = itins_on_airline[airline].length;
                var cur_ratio = cur_number/number_of_itins_on_airline[airline];
                if ( (cur_ratio > ratio_of_untaken_itins) || ( (cur_ratio == ratio_of_untaken_itins) && (cur_number > number_of_untaken_itins) ) )
                {
                    number_of_untaken_itins = cur_number;
                    ratio_of_untaken_itins = cur_ratio;
                    take_the_airline = airline;
                }
            }

            var cur_idx = ID.indexOf(itins_on_airline[take_the_airline][0].id);
            cur_rank++;
            itins[cur_idx].best_airl_rank2 = cur_rank;

            // delete the first element
            itins_on_airline[take_the_airline] = _.drop(itins_on_airline[take_the_airline]);
        }

        // assign a larger airline_rank2 to the other itins, according to their position in itins_other
        for(var i=0; i<itins_other.length; i++)
        {
            var cur_idx = ID.indexOf(itins_other[i].id);
            cur_rank++;
            itins[cur_idx].best_airl_rank2 = cur_rank;
        }

    }, // end of function append_1D_airline_rank2

    rank_itineraries_in_3D_by_price_duration_airline2: function (itins, snowflake)
    {
        if (itins.length == 0) return; // If empty, then nothing to rank
        if (itins.length == 1) { // If just one itinerary, then ranking is easy
          itins[0].smartRank = 1;
          itins[0].why_this = 'the cheapest, the shortest, the best trade-off';
          return;
        }

        var preferred_airlines = [];
        if ( !( snowflake === undefined ) )
          if ( !( snowflake.profile === undefined ) )
            if ( !( snowflake.profile.preferred_airlines_iata === undefined ) )
              preferred_airlines = snowflake.profile.preferred_airlines_iata;

        // if price_preference < duration_preference, then low price is more important than low duration
        if ( snowflake.preference.price    === undefined ) { snowflake.preference.price    = 1.0; } // default value is 1
        if ( snowflake.preference.duration === undefined ) { snowflake.preference.duration = 1.0; } // default value is 1
        if ( snowflake.preference.airline  === undefined ) { snowflake.preference.airline  = 1.0; } // default value is 1

        if (preferred_airlines.length == 0) { snowflake.preference.airline = 3 * Math.max(snowflake.preference.price, snowflake.preference.duration); }

        onvoya.log.info("Ranking based on price preference " + snowflake.preference.price +
                                   ", duration preference " + snowflake.preference.duration +
                                    ", airline preference " + snowflake.preference.airline + ", while emphasizing the following airlines: [" + preferred_airlines + "]");

        if ( !itins[0].hasOwnProperty('priceRank') ) this.compute_priceRank(itins); // append priceRank field if needed
        this.normalize_priceRank(itins);

        // appends best_airl_rank2 field if needed
        if ( !itins[0].hasOwnProperty('best_airl_rank2') ) this.append_1D_airline_rank2(itins, preferred_airlines, snowflake.preference.price, snowflake.preference.duration);

        if ( snowflake.preference.price    == 0 ) return;
        if ( snowflake.preference.duration == 0 ) return;
        if ( snowflake.preference.airline  == 0 ) return;

        var Median_duration = this.median_in_duration  (itins) + 1; //onvoya.log.info("Median_duration = " + Median_duration);
        var Median_airline  = this.median_in_airl_rank2(itins) + 1; //onvoya.log.info("Median_airline = "  + Median_airline);

        // sort in 3D by linear combination of price, duration, and airline_rank2
        itins.sort( this.compare_in_3D_by_linear_combination_of_price_duration_airline2(snowflake.preference.price,
                                                                                        snowflake.preference.duration*Median_duration,
                                                                                        snowflake.preference.airline*Median_airline) );

        // append the incremental smartRank, starting from 1
        for (var i = 0; i < itins.length; i++) {
          itins[i].smartRank = i+1;
        }

        // append explanations as to why each particular itin is recommended
        this.append_explanation_to_ranked_itins(itins);

        this.print_many_itineraries(itins);

        // keep only the best half of itins, if needed
        if (snowflake.top_flights_only) {
          var full_length = itins.length;
          var half_length = Math.floor(full_length/2);
          itins.length = half_length;
          onvoya.log.info("Returning top flights only (" + half_length + " of " + full_length + ")");
        } else {
          onvoya.log.info("Returning the full set of flights (" + itins.length + " itins)");
        }

        return;

    }, // end of function rank_itineraries_in_3D_by_price_duration_airline2

    append_explanation_to_ranked_itins: function (itins)
    {
        var lowest_price     = Math.min.apply(null,itins.map(function(it) { return +it.price          ; })); // convert string to float
        var lowest_duration  = Math.min.apply(null,itins.map(function(it) { return  it.durationMinutes; }));
        var lowest_smartRank = Math.min.apply(null,itins.map(function(it) { return  it.smartRank      ; }));

        // append explanations
        for (var i = 0; i < itins.length; i++) {
          delete itins[i].why_this; // delete previous explanations
          if ( +itins[i].price           == lowest_price     ) itins[i].why_this = ( (itins[i].why_this ===undefined) ? ("") : (itins[i].why_this + ", ") ) + "the cheapest";
          if (  itins[i].durationMinutes == lowest_duration  ) itins[i].why_this = ( (itins[i].why_this ===undefined) ? ("") : (itins[i].why_this + ", ") ) + "the shortest";
          if (  itins[i].smartRank       == lowest_smartRank ) itins[i].why_this = ( (itins[i].why_this ===undefined) ? ("") : (itins[i].why_this + ", ") ) + "the best trade-off";
        }

        return;
    } // end of function append_explanation_to_ranked_itins
};
