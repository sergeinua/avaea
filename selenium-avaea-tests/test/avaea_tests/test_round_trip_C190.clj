(ns avaea-tests.test-round-trip-c190
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Wrong date for Depart or Return'

      Steps:

      1. Tap the mike and start talk (choose dates that are more than 330 days from now)
      2. Tap the 'Continue'

      Expected:

      1. Phrase for the search is displayed
      2. Dates displays in Calendar. Buttons 'All flights' and 'Top flights' are disabled (grey).
         Impossible to search tickets
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "Wrong date for Depart or Return"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "Kiev" :airport "KBP"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-date (tomorow-str))
       (dotimes [n 12]
         (click ($ (:calendar-next-button page))))
       (select-random-date))
 (click ($ (:calendar-done-button page)))

 (fact "Search Button is disabled"
       ($ (:search-button page)) => disabled?)

 (quit))
