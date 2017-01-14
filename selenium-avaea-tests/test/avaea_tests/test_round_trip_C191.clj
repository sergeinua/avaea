(ns avaea-tests.test-round-trip-c191
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'No search with empty 'Return' date'

      Steps:

      1. Choose in 'From' and 'To' different airports (for example NYC and KBP)
      2. Tap the Calendar and choose only one date
      3. Tap 'Done' button
      4. Tap 'All flights' or 'Top flights'

      Expected:

      1. The same airport is displayed
      2. Chosen date are displaying on page
      3. Chosen date displays in 'Depart' date. 'Return' date is empty
      4. 'Return' date is highlighted. No search
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "(C191) No search with empty 'Return' date"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "Kiev" :airport "KBP"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-random-date)
       (click ($ (:calendar-done-button page))))

 (fact "Search Button is disabled"
       ($ (:search-button page)) => disabled?)

 (quit))
