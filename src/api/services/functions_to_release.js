module.exports = {

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
    },

    compute_departure_times_in_minutes: function (itins)
    // adds a new field to the array of itineraries: depatureMinutes
    {
        for(var i=0; i<itins.length; i++)
        {
            var d = this.parseTime(itins[i].citypairs[0].from.time);
            itins[i].depatureMinutes = d.getHours() *60 + d.getMinutes();
        }
    },

    determine_airline: function (itins)
    // adds a new field to the array of itineraries: air_line
    {
        for(var i=0; i<itins.length; i++)
            itins[i].air_line = itins[i].citypairs[0].flights[0].abbrNumber.substring(0,2); // first two characters
    },

    determine_airline_preferences: function (itins)
    // adds a new field to the array of itineraries: air_line_pref (the smaller the value, the better the airline is)
    {
        light_output = false;

        AL = itins.map(function(it){return it.air_line}); // extract all the airlines into a separate array
        if (light_output)
        {
            console.log("Decoded airlines in the original order :");
            console.log(AL);
        }

        AL_counts = {};
        AL.forEach(function(x) { AL_counts[x] = (AL_counts[x] || 0)+1; });
        if (light_output)
        {
            console.log("Their repetitions :");
            console.log(AL_counts);
        }

        AL_counts_keysSorted = Object.keys(AL_counts).sort(function(a,b){return AL_counts[b]-AL_counts[a]});
        if (light_output)
        {
            console.log("Airlines sorted by popularity:");
            console.log(AL_counts_keysSorted); // array of 2-letter airline name strings, sorted by popularity
        }

        // Now loop through AL_counts_keysSorted and take 1 airline from each key at a time (and decrease counts) until all the counts are zero.

        var preferred_airline_indices = [];

        while (preferred_airline_indices.length < itins.length)
        {
            function extract_preferred_airline_indices(value_ALname, key_idx, array_ALcounts_keys_sorted)
            {
                if (AL_counts[value_ALname]!=0)
                {
                    idx = AL.indexOf(value_ALname); // search for the airline in the original list
                    preferred_airline_indices.push(idx); // save its position
                    AL[idx] = "00"; // replace with dummy airline
                    AL_counts[value_ALname]--; // decrease the count
                }
            }

            AL_counts_keysSorted.forEach(extract_preferred_airline_indices);
        }

        if (light_output)
        {
            console.log("Preferred airline indices :");
            console.log(preferred_airline_indices);

            console.log("Preferred airlines :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = itins[preferred_airline_indices[i]].air_line; }; console.log(temp);
            console.log();
        }

        return preferred_airline_indices;
    },

    print_one_itinerary: function (prefix,itin)
    {
        d = this.parseTime(itin.citypairs[0].from.time);

        dep_rank_str = (itin.best_dep_rank===undefined)?(""):(" with dep_rank " + itin.best_dep_rank);
        air_line_str = (itin.air_line===undefined)?(""):(" on " + itin.air_line);
        airl_rank_str = (itin.best_airl_rank===undefined)?(""):(" with airl_rank " + itin.best_airl_rank);
        smartRank_str = (itin.smartRank===undefined)?(""):(", smartRank = " + itin.smartRank);

        console.log( prefix + "$" + itin.price
                            + ", " + itin.durationMinutes + " mins"
                            + ", departs " + itin.citypairs[0].from.time
                            //+ " (" + d.getHours() + ":" + ('0'+d.getMinutes()).slice(-2) + ")"
                            + " (" + itin.depatureMinutes + " mins)"
                            + dep_rank_str
                            + air_line_str
                            + airl_rank_str
                            + smartRank_str
                   );
    },

    print_many_itineraries: function (itins)
    {
        if (itins.length == 0) console.log("No itineraries");
        if (itins.length == 1) this.print_one_itinerary("Itinerary : ", itins[0]);
        if (itins.length > 1)
            for(var i=0; i<itins.length; i++)
                this.print_one_itinerary("Itinerary " + i + " of " + itins.length + ": ", itins[i]);
    },

    compare_price: function (a, b) // price is a string
    {
        var a_price = +a.price; // convert string to float
        var b_price = +b.price; // convert string to float
        if (a_price > b_price) return 1;
        else if (a_price < b_price) return -1;
        return 0;
    },

    sort_by_increasing_price: function (itins)
    {
        itins.sort(this.compare_price);
    },

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
    },

    median_in_price: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_price);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return +itins_loc[center_index].price;
        else
            return (+itins_loc[center_index-1].price + +itins_loc[center_index].price) / 2.0;
    },

    median_absolute_deviation_in_price: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        var median_price = this.median_in_price(itins);

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_price_by_distance_from_median(median_price) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(+itins_loc[center_index].price - median_price);
        else
            return ( Math.abs(+itins_loc[center_index-1].price - median_price) +
                     Math.abs(+itins_loc[center_index  ].price - median_price) ) / 2.0;
    },

    compare_duration: function (a, b)
    {
        if (a.durationMinutes > b.durationMinutes) return 1;
        else if (a.durationMinutes < b.durationMinutes) return -1;
        return 0;
    },

    sort_by_increasing_duration: function (itins)
    {
        itins.sort(this.compare_duration);
    },

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
    },

    median_in_duration: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_duration);

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].durationMinutes;
        else
            return (itins_loc[center_index-1].durationMinutes + itins_loc[center_index].durationMinutes) / 2.0;
    },

    median_absolute_deviation_in_duration: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        var median_duration = this.median_in_duration(itins);

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_duration_by_distance_from_median(median_duration) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].durationMinutes - median_duration);
        else
            return ( Math.abs(itins_loc[center_index-1].durationMinutes - median_duration) +
                     Math.abs(itins_loc[center_index  ].durationMinutes - median_duration) ) / 2.0;
    },

    compare_dep_rank: function (a, b)
    {
        if (a.best_dep_rank > b.best_dep_rank) return 1;
        else if (a.best_dep_rank < b.best_dep_rank) return -1;
        return 0;
    },

    sort_by_increasing_dep_rank: function (itins)
    {
        itins.sort(this.compare_dep_rank);
    },

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
    },

    median_in_dep_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_dep_rank);

        center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].best_dep_rank;
        else
            return (itins_loc[center_index-1].best_dep_rank + itins_loc[center_index].best_dep_rank) / 2.0;
    },

    median_absolute_deviation_in_dep_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        median_dep_rank = this.median_in_dep_rank(itins);

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_dep_rank_by_distance_from_median(median_dep_rank) );

        center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].best_dep_rank - median_dep_rank);
        else
            return ( Math.abs(itins_loc[center_index-1].best_dep_rank - median_dep_rank) +
                     Math.abs(itins_loc[center_index  ].best_dep_rank - median_dep_rank) ) / 2.0;
    },

    compare_airl_rank: function (a, b)
    {
        if (a.best_airl_rank > b.best_airl_rank) return 1;
        else if (a.best_airl_rank < b.best_airl_rank) return -1;
        return 0;
    },

    sort_by_increasing_airl_rank: function (itins)
    {
        itins.sort(this.compare_airl_rank);
    },

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
    },

    median_in_airl_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median
    {
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort(this.compare_airl_rank);

        center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return itins_loc[center_index].best_airl_rank;
        else
            return (itins_loc[center_index-1].best_airl_rank + itins_loc[center_index].best_airl_rank) / 2.0;
    },

    median_absolute_deviation_in_airl_rank: function (itins)
    // https://en.wikipedia.org/wiki/Median_absolute_deviation
    {
        median_airl_rank = this.median_in_airl_rank(itins);

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying or even sorting
                         .sort( this.compare_in_airl_rank_by_distance_from_median(median_airl_rank) );

        center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].best_airl_rank - median_airl_rank);
        else
            return ( Math.abs(itins_loc[center_index-1].best_airl_rank - median_airl_rank) +
                     Math.abs(itins_loc[center_index  ].best_airl_rank - median_airl_rank) ) / 2.0;
    },

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
    },

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
    },

    compare_in_2D_first_by_price_then_by_duration: function (a, b) // price is a string
    {
        var a_price = +a.price; // convert string to float
        var b_price = +b.price; // convert string to float
        if (a_price > b_price) return 1;
        else if (a_price < b_price) return -1;
        else if (a.durationMinutes > b.durationMinutes) return 1;
        else if (a.durationMinutes < b.durationMinutes) return -1;
        return 0;
    },

    sort_in_2D_first_by_increasing_price_then_by_increasing_duration: function (itins)
    {
        itins.sort(this.compare_in_2D_first_by_price_then_by_duration);
    },

    is_different_price_from_previous: function (element, index, array)
    {
        if (index==0) return true;
        else if (+element.price != +array[index-1].price) return true;
        return false;
    },

    is_shorter_but_more_expensive_than_previous: function (element, index, array)
    {
        //arguments.callee.previous_good_itin_index is a static variable, stored within this function

        if (index==0)
            { arguments.callee.previous_good_itin_index = index; return true; }
        else if ( +element.price > +array[arguments.callee.previous_good_itin_index].price &&
                   element.durationMinutes < array[arguments.callee.previous_good_itin_index].durationMinutes)
            { arguments.callee.previous_good_itin_index = index; return true; }
        return false;
    },

    prune_itineraries: function (itins)
    {
        if (itins.length == 0) return itins; // If empty, then nothing to prune

        // Find the index of the cheapest itinerary
        cheapest_idx = this.find_the_cheapest_itinerary(itins);
        cheapest_duration =  itins[cheapest_idx].durationMinutes;

        // Find the index of the shortest itinerary
        shortest_idx = this.find_the_shortest_itinerary(itins);
        shortest_price    = +itins[shortest_idx].price; // convert string to float

        return itins.filter( function(it){return(+it.price<=shortest_price)} )             // only keep the ones with +price <= shortest_price
                    .filter( function(it){return(it.durationMinutes<=cheapest_duration)} ) // only keep the ones with duration <= cheapest_duration
                    .sort(this.compare_in_2D_first_by_price_then_by_duration)                   // sort by price and than by duration
                    .filter(this.is_shorter_but_more_expensive_than_previous)                   // only keep the ones that are shorter and more expensive than the previous kept one
                    ;
    },

    compare_in_2D_by_linear_combination: function (price_pref,duration_pref) // compare in 2D by linear combination of price and duration
    // if price_preference < duration_preference, then low price is more important then low duration
    // if price_preference > duration_preference, then low duration is more important then low price
    {
        return function(a, b)
        {
            var a_linear_combination = duration_pref*(+a.price) + price_pref*a.durationMinutes; // convert price from string to float
            var b_linear_combination = duration_pref*(+b.price) + price_pref*b.durationMinutes; // convert price from string to float

            if (a_linear_combination > b_linear_combination) return 1;
            else if (a_linear_combination < b_linear_combination) return -1;
            return 0;
        };
    },

    compare_in_3D_by_linear_combination: function (price_pref, duration_pref, departure_pref) // compare in 2D by linear combination of price, duration, and departure
    // if price_preference < duration_preference, then low price is more important then low duration
    // if price_preference > duration_preference, then low duration is more important then low price
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
    },

    compare_in_4D_by_linear_combination: function (price_pref, duration_pref, departure_pref, airline_pref) // compare in 2D by linear combination of price, duration, departure, and airline
    // if price_preference < duration_preference, then low price is more important then low duration
    // if price_preference > duration_preference, then low duration is more important then low price
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
    },

    rank_itineraries: function (itins, price_preference, duration_preference)
    // price_preference and duration_preference can be positive, negative, or zero, but can't both be zero at the same time.
    // positive number means that lower values are preferred.
    // negative number means that higher values are preferred.
    {
        // if price_preference < duration_preference, then low price is more important then low duration
        if(price_preference    === undefined) { price_preference    = 1.0; } // default value is 1
        if(duration_preference === undefined) { duration_preference = 1.0; } // default value is 1

        if ( price_preference==0 && duration_preference==0) return itins;

        var MAD_price = this.median_absolute_deviation_in_price(itins);
        var MAD_duration = this.median_absolute_deviation_in_duration(itins);

        return itins.slice(0)                                                                                                  // make a copy
                    .sort(this.compare_in_2D_by_linear_combination(price_preference/MAD_duration,duration_preference/MAD_price) ); // sort in 2D by linear combination of price and duration
    },

    find_closest_array_index: function (a, start_idx, end_idx, x)
    // a -- array
    // x -- number
    {
        if (start_idx >  end_idx) return -1; // if empty, return NaN // TO DO: deal with NaNs
        if (start_idx == end_idx) return start_idx; // if single element, return this element
        if (x <= a[start_idx]) return start_idx; // if x is smaller than anything, return the first element
        if (x >= a[end_idx  ]) return end_idx  ; // if x is greater than anything, return the last element

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
    },

    order_by_diversity: function (data, axis_start, axis_end) // data --- array of numbers
    // output is the array of integer indices [i1 i2 ... iN], such that data[i1] is better than data[i2], which is better than data[i3], ..., which is better than data[iN]
    // TODO: do we need to assign the same rank to itineraries with the same  values?
    {
        if (data.length == 0) return []; // If empty, then nothing to do
        if (data.length == 1) return [0]; // If one element, then nothing to do
        if (data.length == 2) return [0,1]; // If two elements, then nothing to do

        //console.log("data length = " + data.length);

        data_loc = data.slice(0) // make a copy
                       .sort(function(a, b){return a-b});

        //console.log("data_loc length = "+ data_loc.length);

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
    },

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
    },

    prune_itineraries_in_3D: function (itins)
    {
        light_output = false;
        heavy_output = false;

        if (itins.length == 0) return itins; // If empty, then nothing to prune

        if (light_output) console.log("================  Output from prune_itineraries_in_3D(..)  ================");

        // Find the index of the cheapest itinerary
        cheapest_idx = this.find_the_cheapest_itinerary(itins);

        // Find the index of the shortest itinerary
        shortest_idx = this.find_the_shortest_itinerary(itins);

        // Find the index of the best departure itinerary
        array_of_departures = itins.map(function(it){return it.depatureMinutes}); // extract all the departure values into a separate array
        if (light_output)
        {
            console.log("Decoded departures in minutes, in the original order :");
            console.log(array_of_departures);
        }
        array_of_departures = this.order_by_increasing_values(array_of_departures); // sort while saving permutation indices
        if (light_output)
        {
            console.log("Decoded departures in minutes, sorted, permutation indices saved :");
            console.log(array_of_departures);
        }
        preferred_departures_indices = this.order_by_diversity(array_of_departures, 0, 24*60); // order by diversity
        if (light_output)
        {
            console.log("Indices of the best departures, ordered by diversity :");
            console.log(preferred_departures_indices);
        }
        best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[0]];

        // append the departure ranking information to itineraries: the smaller best_dep_rank is, the better the itinerary is
        for(var i=0; i<array_of_departures.length; i++) { itins[array_of_departures.sortIndices[preferred_departures_indices[i]]].best_dep_rank = i; };

        if (light_output)
        {
            console.log("Decoded departures in minutes, sorted by departure preference :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = array_of_departures[preferred_departures_indices[i]]; }; console.log(temp);
            console.log("Indices of the above departures into the original itinerary array :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = preferred_departures_indices[i]; }; console.log(temp);
            console.log();
        }

        if (light_output)
        {
            this.print_one_itinerary("The cheapest itinerary is # " + cheapest_idx + " of " + itins.length + " : ", itins[cheapest_idx]);
            this.print_one_itinerary("The shortest itinerary is # " + shortest_idx + " of " + itins.length + " : ", itins[shortest_idx]);
            this.print_one_itinerary("The best-departure itinerary is # " + best_dep_idx + " of " + itins.length + " : ", itins[best_dep_idx]);
            next_best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[1]];
            this.print_one_itinerary("The next best-departure itinerary is # " + next_best_dep_idx + " of " + itins.length + " : ", itins[next_best_dep_idx]);
            console.log();
        }

        cheapest_price     = +itins[cheapest_idx].price; // convert string to float // not needed
        cheapest_duration  =  itins[cheapest_idx].durationMinutes; // needed later for filtering
        cheapest_departure =  itins[cheapest_idx].depatureMinutes; // not needed
        cheapest_dep_rank  =  itins[cheapest_idx].best_dep_rank; // needed later for filtering

        shortest_price     = +itins[shortest_idx].price; // convert string to float // needed later for filtering
        shortest_duration  =  itins[shortest_idx].durationMinutes; // not needed
        shortest_departure =  itins[shortest_idx].depatureMinutes; // not needed
        shortest_dep_rank  =  itins[shortest_idx].best_dep_rank; // needed later for filtering

        best_dep_price     = +itins[best_dep_idx].price; // convert string to float
        best_dep_duration  =  itins[best_dep_idx].durationMinutes; // needed later for filtering
        best_dep_departure =  itins[best_dep_idx].depatureMinutes; // not needed
        best_dep_dep_rank  =  itins[best_dep_idx].best_dep_rank; // should be zero // not needed

        loc_itins = itins.slice(0) // make a copy
                         .filter( function(it){return(it.durationMinutes<=cheapest_duration || it.best_dep_rank<=cheapest_dep_rank )} )  // only keep the ones with duration < cheapest duration or dep better than the cheapest departure
                         .filter( function(it){return(+it.price<=shortest_price || it.best_dep_rank<=shortest_dep_rank )} )              // only keep the ones with price < shortest price or dep better than the shortest departure
                         .filter( function(it){return(it.durationMinutes<=best_dep_duration || +it.price<=best_dep_price )} );           // only keep the ones with duration < best departure duration or price < best departure price

        // At this point three worst octants have been removed. These octants are attached to the cheapest, shortest, and best_dep itineraries

        if (light_output)
        {
            console.log("3D-semipruned itineraries :");
            this.print_many_itineraries(loc_itins);
            console.log();
        }

        // Now we need to finish the pruning by examining itineraries pairwise and removing the ones that are guaranteed worse in all dimensions (in all attributes) in 3D

        for(var i=0; i<loc_itins.length; i++)
        {
            if (heavy_output)
            {
                temp_to_remove = loc_itins.slice(0) // make a copy
                                          .filter( function(it){return( ( +it.price >= +loc_itins[i].price ) && ( it.durationMinutes >= loc_itins[i].durationMinutes ) && ( it.best_dep_rank > loc_itins[i].best_dep_rank ) )} );

                if (temp_to_remove.length>0)
                {
                    if (temp_to_remove.length==1)
                    {
                        this.print_one_itinerary("Itinerary : ", temp_to_remove[0]);
                        console.log("is removed because it is worse than");
                    }
                    else
                    {
                        console.log("Itineraries :");
                        this.print_many_itineraries(temp_to_remove);
                        console.log("are removed because they are worse than");
                    }

                    this.print_one_itinerary("Itinerary : ", loc_itins[i]);
                    console.log();
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
            console.log("3D-fully-pruned itineraries :");
            this.print_many_itineraries(loc_itins);
            console.log("===========================================================================");
            console.log();
        }

        return loc_itins;
    },

    rank_itineraries_in_3D: function (itins, price_preference, duration_preference, departure_preference)
    {
        // if price_preference < duration_preference, then low price is more important then low duration
        if ( price_preference     === undefined ) { price_preference     = 1.0; } // default value is 1
        if ( duration_preference  === undefined ) { duration_preference  = 1.0; } // default value is 1
        if ( departure_preference === undefined ) { departure_preference = 1.0; } // default value is 1

        if ( price_preference     == 0 ) return itins;
        if ( duration_preference  == 0 ) return itins;
        if ( departure_preference == 0 ) return itins;

        var MAD_price    = this.median_absolute_deviation_in_price   (itins);
        var MAD_duration = this.median_absolute_deviation_in_duration(itins);
        var MAD_dep_rank = this.median_absolute_deviation_in_dep_rank(itins);

        return itins.slice(0) // make a copy
                    .sort( this.compare_in_3D_by_linear_combination(price_preference*MAD_price,duration_preference*MAD_duration,departure_preference*MAD_dep_rank) ); // sort in 3D by linear combination of price, duration, and dep_rank
    },

    prune_itineraries_in_4D: function (itins)
    {
        light_output = false;
        heavy_output = false;

        if (itins.length == 0) return itins; // If empty, then nothing to prune

        if (light_output) console.log("================  Output from prune_itineraries_in_4D(..)  ================");

        // Find the index of the cheapest itinerary
        cheapest_idx = this.find_the_cheapest_itinerary(itins);

        // Find the index of the shortest itinerary
        shortest_idx = this.find_the_shortest_itinerary(itins);

        // Find the index of the best departure itinerary
        array_of_departures = itins.map(function(it){return it.depatureMinutes}); // extract all the departure values into a separate array
        if (light_output)
        {
            console.log("Decoded departures in minutes, in the original order (length "+array_of_departures.length+") :");
            console.log(array_of_departures);
        }
        array_of_departures = this.order_by_increasing_values(array_of_departures); // sort while saving permutation indices
        if (light_output)
        {
            console.log("Decoded departures in minutes, sorted, permutation indices saved (length "+array_of_departures.length+", sortIndices length "+array_of_departures.sortIndices.length+") :");
            console.log(array_of_departures);
        }
        preferred_departures_indices = this.order_by_diversity(array_of_departures, 0, 24*60); // order by diversity
        if (light_output)
        {
            console.log("Indices of the best departures, ordered by diversity (length "+preferred_departures_indices.length+"):");
            console.log(preferred_departures_indices);
        }
        best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[0]];

        //console.log("best_dep_idx = " + best_dep_idx);
        //console.log("i is changing from 0 to < " + array_of_departures.length);
        //console.log("preferred_departures_indices (length " + preferred_departures_indices.length + ") =");
        //console.log(preferred_departures_indices);
        //console.log("array_of_departures.sortIndices (length " + array_of_departures.sortIndices.length + ") =");
        //console.log(array_of_departures.sortIndices);
        //console.log("itins length is " + itins.length);

        // append the departure ranking information to itineraries: the smaller best_dep_rank is, the better the itinerary is
        for(var i=0; i<array_of_departures.length; i++)
        {
            //console.log("i = " + i + ", pdi = " + preferred_departures_indices[i] + " aod.sI = " + array_of_departures.sortIndices[preferred_departures_indices[i]]);
            itins[array_of_departures.sortIndices[preferred_departures_indices[i]]].best_dep_rank = i;
        };

        if (light_output)
        {
            console.log("Decoded departures in minutes, sorted by departure preference :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = array_of_departures[preferred_departures_indices[i]]; }; console.log(temp);
            console.log("Indices of the above departures into the original itinerary array :");
            temp=[]; for(var i=0; i<array_of_departures.length; i++) { temp[i] = preferred_departures_indices[i]; }; console.log(temp);
            console.log();
        }

        // Find the index of the best airline itinerary
        preferred_airline_indices = this.determine_airline_preferences(itins);
        best_airl_idx = preferred_airline_indices[0];

        // append the airline ranking information to itineraries: the smaller best_airl_rank is, the better the itinerary is
        for(var i=0; i<preferred_airline_indices.length; i++) { itins[preferred_airline_indices[i]].best_airl_rank = i; };

        if (light_output)
        {
            this.print_one_itinerary("The cheapest itinerary is # " + cheapest_idx + " of " + itins.length + " : ", itins[cheapest_idx]);
            this.print_one_itinerary("The shortest itinerary is # " + shortest_idx + " of " + itins.length + " : ", itins[shortest_idx]);
            this.print_one_itinerary("The best-departure itinerary is # " + best_dep_idx + " of " + itins.length + " : ", itins[best_dep_idx]);
            next_best_dep_idx = array_of_departures.sortIndices[preferred_departures_indices[1]];
            this.print_one_itinerary("The next best-departure itinerary is # " + next_best_dep_idx + " of " + itins.length + " : ", itins[next_best_dep_idx]);
            this.print_one_itinerary("The best-airline itinerary is # " + best_airl_idx + " of " + itins.length + " : ", itins[best_airl_idx]);
            next_best_airl_idx = preferred_airline_indices[1];
            this.print_one_itinerary("The next best-airline itinerary is # " + next_best_airl_idx + " of " + itins.length + " : ", itins[next_best_airl_idx]);
            console.log();
        }

        cheapest_price     = +itins[cheapest_idx].price; // convert string to float // not needed
        cheapest_duration  =  itins[cheapest_idx].durationMinutes; // needed later for filtering
        cheapest_departure =  itins[cheapest_idx].depatureMinutes; // not needed
        cheapest_dep_rank  =  itins[cheapest_idx].best_dep_rank; // needed later for filtering
        cheapest_air_line  =  itins[cheapest_idx].air_line; // not needed
        cheapest_airl_rank =  itins[cheapest_idx].best_airl_rank; // needed later for filtering

        shortest_price     = +itins[shortest_idx].price; // convert string to float // needed later for filtering
        shortest_duration  =  itins[shortest_idx].durationMinutes; // not needed
        shortest_departure =  itins[shortest_idx].depatureMinutes; // not needed
        shortest_dep_rank  =  itins[shortest_idx].best_dep_rank; // needed later for filtering
        shortest_air_line  =  itins[shortest_idx].air_line; // not needed
        shortest_airl_rank =  itins[shortest_idx].best_airl_rank; // needed later for filtering

        best_dep_price     = +itins[best_dep_idx].price; // convert string to float
        best_dep_duration  =  itins[best_dep_idx].durationMinutes; // needed later for filtering
        best_dep_departure =  itins[best_dep_idx].depatureMinutes; // not needed
        best_dep_dep_rank  =  itins[best_dep_idx].best_dep_rank; // should be zero // not needed
        best_dep_air_line  =  itins[best_dep_idx].air_line; // not needed
        best_dep_airl_rank =  itins[best_dep_idx].best_airl_rank; // needed later for filtering

        best_airl_price     = +itins[best_airl_idx].price; // convert string to float
        best_airl_duration  =  itins[best_airl_idx].durationMinutes; // needed later for filtering
        best_airl_departure =  itins[best_airl_idx].depatureMinutes; // not needed
        best_airl_dep_rank  =  itins[best_airl_idx].best_dep_rank; // should be zero // not needed
        best_airl_air_line  =  itins[best_airl_idx].air_line; // not needed
        best_airl_airl_rank =  itins[best_airl_idx].best_airl_rank; // needed later for filtering

        loc_itins = itins.slice(0) // make a copy
                         .filter( function(it){return(it.durationMinutes<=cheapest_duration || it.best_dep_rank<=cheapest_dep_rank || it.best_airl_rank<=cheapest_airl_rank )} )  // only keep the ones with duration < cheapest duration, or dep better than the cheapest departure, or airline better than the cheapest airline
                         .filter( function(it){return(+it.price<=shortest_price || it.best_dep_rank<=shortest_dep_rank || it.best_airl_rank<=shortest_airl_rank )} )              // only keep the ones with price < shortest price, or dep better than the shortest departure, or airline better than the shortest airline
                         .filter( function(it){return(it.durationMinutes<=best_dep_duration || +it.price<=best_dep_price || it.best_airl_rank<=best_dep_airl_rank )} )            // only keep the ones with duration < best departure duration, or price < best departure price, or airline better than the best departure airline
                         .filter( function(it){return(it.durationMinutes<=best_airl_duration || +it.price<=best_airl_price || it.best_dep_rank<=best_airl_dep_rank )} );          // only keep the ones with duration < best airline duration, or price < best airline price, or departure better than the best airline airline

        // At this point three worst octants have been removed. These octants are attached to the cheapest, shortest, and best_dep itineraries

        if (light_output)
        {
            console.log("4D-semipruned itineraries :");
            this.print_many_itineraries(loc_itins);
            console.log();
        }

        // Now we need to finish the pruning by examining itineraries pairwise and removing the ones that are guaranteed worse in all dimensions (in all attributes) in 3D

        for(var i=0; i<loc_itins.length; i++)
        {
            if (heavy_output)
            {
                temp_to_remove = loc_itins.slice(0) // make a copy
                                          .filter( function(it){return( ( +it.price >= +loc_itins[i].price ) && ( it.durationMinutes >= loc_itins[i].durationMinutes ) && ( it.best_dep_rank > loc_itins[i].best_dep_rank ) && ( it.best_airl_rank > loc_itins[i].best_airl_rank ) )} );

                if (temp_to_remove.length>0)
                {
                    if (temp_to_remove.length==1)
                    {
                        this.print_one_itinerary("Itinerary : ", temp_to_remove[0]);
                        console.log("is removed because it is worse than");
                    }
                    else
                    {
                        console.log("Itineraries :");
                        this.print_many_itineraries(temp_to_remove);
                        console.log("are removed because they are worse than");
                    }

                    this.print_one_itinerary("Itinerary : ", loc_itins[i]);
                    console.log();
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
            console.log("4D-fully-pruned itineraries :");
            this.print_many_itineraries(loc_itins);
            console.log("===========================================================================");
            console.log();
        }

        return loc_itins;
    },

    rank_itineraries_in_4D: function (itins, price_preference, duration_preference, departure_preference, airline_preference)
    {
        // if price_preference < duration_preference, then low price is more important then low duration
        if ( price_preference     === undefined ) { price_preference     = 1.0; } // default value is 1
        if ( duration_preference  === undefined ) { duration_preference  = 1.0; } // default value is 1
        if ( departure_preference === undefined ) { departure_preference = 1.0; } // default value is 1
        if ( airline_preference   === undefined ) { airline_preference   = 1.0; } // default value is 1

        sails.log.info("Ranking based on the following preferences: price " + price_preference + ", duration " + duration_preference + ", departure " + departure_preference + ", airline " + airline_preference);

//         Profile.findOneByUserId( req.user.id ).exec(function findOneCB(err, found) {
//         sails.log.info("Preferred airlines: "+ found.preferred_airlines);
//         });

        if ( (price_preference==0) || (duration_preference==0) || (departure_preference==0) || (airline_preference==0) )
        {
            price_preference     += 0.1;
            duration_preference  += 0.1;
            departure_preference += 0.1;
            airline_preference   += 0.1;
        }

        //console.log("Ranking base on the following preferences: price " + price_preference + ", duration " + duration_preference + ", departure " + departure_preference + ", airline " + airline_preference);

        var MAD_price     = this.median_absolute_deviation_in_price    (itins);
        var MAD_duration  = this.median_absolute_deviation_in_duration (itins);
        var MAD_dep_rank  = this.median_absolute_deviation_in_dep_rank (itins);
        var MAD_airl_rank = this.median_absolute_deviation_in_airl_rank(itins);
        return itins.slice(0) // make a copy
                    .sort( this.compare_in_4D_by_linear_combination(price_preference    *MAD_price    ,
                                                                    duration_preference *MAD_duration ,
                                                                    departure_preference*MAD_dep_rank ,
                                                                    airline_preference  *MAD_airl_rank) ); // sort in 4D by linear combination of price, duration, dep_rank, and airl_rank
    },

    is_in_array: function (array, element)
    {
        return array.indexOf(element) >= 0;
    },

    sort_by_preferred_airlines: function (itins, preferred_airlines)
    // Sorting by price, taking into account $100 price discount for preferred_airlines.
    // The airlines, specified in the array preferred_airlines are given a price advantage of $100, when sorting by price.
    {
        var loc_itins = itins.slice(0); // make a copy

        //var preferred_airline_price_advantage = 100.00;
        var preferred_airline_price_advantage = this.median_in_price(itins)*0.1; // 10% of the median price

        sails.log.info("Ranking based on the price advantage of $" + preferred_airline_price_advantage + " for the following airlines: " + preferred_airlines);

        if (preferred_airlines.length == 0) return loc_itins;

        for(var i=0; i<loc_itins.length; i++)
            if (!this.is_in_array(preferred_airlines,loc_itins[i].air_line) )
                loc_itins[i].price = (Number(loc_itins[i].price) + preferred_airline_price_advantage).toString();

        this.sort_by_increasing_price(loc_itins);

        for(var i=0; i<loc_itins.length; i++)
            if (!this.is_in_array(preferred_airlines,loc_itins[i].air_line) )
                loc_itins[i].price = (Number(loc_itins[i].price) - preferred_airline_price_advantage).toString();

        return loc_itins;
    }

};
