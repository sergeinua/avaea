(ns avaea-tests.test-round-trip-c34
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      The same airport

      Steps:

      Precondition: User is logged in and he is on 'Round Way' tab.
      1. Choose in 'From' and 'To' the same airport
      2. Choose the date for flight
      3. Tap the 'All flights' or 'Top flights'

      Expected:

      1. The same airport is displayed
      2. Chosen date is displayed
      3. Both airports are highlighted. No search
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "(C34) The same airport"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "New York" :airport "NYC"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-random-date)
       (click ($ (:calendar-done-button page))))

 (fact "Chosen date is displayed"
       (:depart-button page) => exists?)

 (fact "Search button is disabled"
       ($ (:search-button page)) => disabled?)

 (quit))

