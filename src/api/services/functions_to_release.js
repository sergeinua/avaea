module.exports = {

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
    {
        if (data.length == 0) return data; // If empty, then nothing to do
        if (data.length == 1) return data; // If one element, then nothing to do
        if (data.length == 2) return data; // If two elements, then nothing to do

        data_loc = data.slice(0) // make a copy
                       .sort(function(a, b){return a-b});

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

            if (iter > 300) break;

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

    compare_price: function (a, b) // price is a string
    {
        var a_price = +a.price; // convert string to float
        var b_price = +b.price; // convert string to float
        if (a_price > b_price) return 1;
        else if (a_price < b_price) return -1;
        return 0;
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
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying and even sorting
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

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying and even sorting
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
        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying and even sorting
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

        itins_loc = itins.slice(0) // make a copy // TO DO: avoid copying and even sorting
                         .sort( this.compare_in_duration_by_distance_from_median(median_duration) );

        var center_index = Math.floor(itins_loc.length/2);

        if(itins_loc.length % 2)
            return Math.abs(itins_loc[center_index].durationMinutes - median_duration);
        else
            return ( Math.abs(itins_loc[center_index-1].durationMinutes - median_duration) +
                     Math.abs(itins_loc[center_index  ].durationMinutes - median_duration) ) / 2.0;
    }
};
