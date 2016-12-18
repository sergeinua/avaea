(ns avaea-tests.test-round-trip-6
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      Steps:

      Precondition: User is logged in and he is on "Round Way" tab.

      1. Choose in "From" and "To" different airports (for example NYC and SFO)
      2. Tap the Calendar and choose the same date for depart and return
      (choose different dates then tap the calendar again and choose only
      one day the same as return, tap the OK)
      3. Tap the "All flights" or "Top flights"
")

(comment "

      Expected:

      1. The same airport is displayed
      2. Chosen date are displaying on page
      3. Both airport are highlighted. User see all possible tickets
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

#_(facts
 "The same day with possible day return"

 (open-browser page-url)

 (click ($ (:round-trip-button page)))

 (fact "Open 'From' Search"

       (click ($ (:from-button page)))

       (wait-element (:airport-input page))

       (fact "Focus on input"
             (focused-element-id) => (:airport-input page))

       (type-text "New York" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have NYC element"
             ($-text (:airport-list-element page)) => #"NYC")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "NYC displays in 'From'"
       ($-text (:from-button page)) => #"NYC")

 (fact "Open 'Destination' search"
       (click ($ (:to-button page)))

       (wait-element (:airport-input page))

       (fact "Focus on input"
             (focused-element-id) => (:airport-input page))

       (type-text "San Francisco" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have SFO element"
             ($-text (:airport-list-element page)) => #"SFO")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "SFO displays in 'From'"
       ($-text (:to-button page)) => #"SFO")

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (click (-> (calendar-dates) (nth 3)))
       (click ($ (:calendar-done-button page)))
       (click ($ (:return-button page)))
       (click (-> (calendar-dates) (nth 3)))
       (click ($ (:calendar-done-button page))))

 #_(fact "Tap All Flights"
       (click ($ (:all-flights page)))
       (when-let [try-again-btn ($ (:try-again-button page))]
         (click try-again-btn)))

 (quit))
