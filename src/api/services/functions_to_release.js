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

        return itins.sort(this.compare_in_2D_by_linear_combination(price_preference,duration_preference) ); // sort in 2D by linear combination of price and duration
    }
};