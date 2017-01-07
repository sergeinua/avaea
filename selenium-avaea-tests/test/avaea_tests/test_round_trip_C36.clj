(ns avaea-tests.test-round-trip-c36
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'The same day with impossible day return'

      Steps:

      1. Choose in 'From' and 'To' different airports (for example NYC and KBP)
      2. Tap the Calendar and choose day with no tickets (for example too late for book tickets for this time)
      3. Tap the 'All flights' or 'Top flights'

      Expected:

      1. The same airport is displayed
      2. Chosen date are displaying on page
      3. Both airport are highlighted. User is on search result page, but see the message:
         No flights are available for selected itinerary. Please try different dates or airports
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "The same day with impossible day return"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "Kiev" :airport "KBP"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-date (tomorow-str))
       (select-date (tomorow-str))
       (click ($ (:calendar-done-button page))))

 (fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-try-again-button page))

       (fact "Try Again Button displayed"
             (:flights-try-again-button page) => displayed?)

       (click ($ (:flights-try-again-button page))))

 (quit))
