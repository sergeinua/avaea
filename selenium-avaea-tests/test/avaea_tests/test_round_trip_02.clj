(ns avaea-tests.test-round-trip-02
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Search of 'all flights' tickets using Farelogix'

      Steps:

      Precondition: User is logged in and he is on "Round Way" tab.
      Farelogix sells tickets only in Canada and some big airports of USA

      1. Tap the "From"
      2. Start typing the city (for example Toronto)
      3. Tap the YTO airport
      4. Tap the "To"
      5. Start typing the city (for example Montreal)
      6. Tap the YMQ
      7. Tap the Calendar and choose any date
      8. Tap the "All flights"
      9. Check with different quantity of "Class" and "Passengers"

      Expected:

      1. Appear drop-down list and "Cancel" button
      2. Search starts looking for (code -> airport name-> city->country)
      3. YTO displays in "From"
      4. Appear drop-down list and "Cancel" button
      5. Search starts looking for (code -> airport name-> city->country)
      6. YMQ displays in "To"
      7. Tap tomorrow day
      8. Appear list of tickets. Go to server logs and see that search was done using Farelogix
      9. Appear list of tickets, where at the top displays correct class and quantity of passengers.
         For the first class will display ("The first" class)
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "Search of 'all flights' tickets using Farelogix"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "Toronto" :airport "YTO"})
 (assign-to-airport {:search-text "Montreal" :airport "YMQ"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (random-select-date-range)
       (click ($ (:calendar-done-button page))))

 (test-class-buttons)
 (test-passengers-buttons)

 (fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-list page))

       (fact "Not Empty"
             ($-elements (as-farelogix (:flights-list page))) => not-empty)

       (fact "Have Prices (all flights)"
             ($ (:flights-result-button page)) =not=> nil))

 (quit))
