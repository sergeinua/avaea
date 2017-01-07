(ns avaea-tests.test-round-trip-07
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'The same day with possible day return'

      Steps:

      1. Choose in 'From' and 'To' different airports (for example NYC and SFO)
      2. Tap the Calendar and choose the same date for depart and return
      3. Tap the 'All flights' or 'Top flights'

      Expected:

      1. The same airport is displayed
      2. Chosen date are displaying on page
      3. Both airport are highlighted. User see all possible tickets
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "The same day with possible day return"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "San Francisco" :airport "SFO"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-random-date-range)
       (click ($ (:calendar-done-button page))))

 (quit))
