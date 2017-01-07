(ns avaea-tests.test-general-c40)

(ns avaea-tests.test-one-way-c176
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Booking with wrong info'

      Steps:

      1. Tap on price near the tickets
      2. Add some info for impossible booking (for example one ticket for Infant)
      3. Add payment card information
      4. Tap the 'booking' button

      Expected:

      1. Appear form with chosen flight, all info from Profile with empty fields for payment card
      2. Added changes are displayed
      3. Info about payment card is displaying
      4. Tickets were not booked. Appear message that something was wrong.
         In logs we see that booking wasn't done. No email receives the user
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "Booking with wrong info"

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
