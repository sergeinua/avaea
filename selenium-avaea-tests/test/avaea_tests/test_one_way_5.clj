(ns avaea-tests.test-one-way-5
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      Steps:

      Precondition: User is logged in and he is on "One Way" tab.
      1. Choose in "From" and "To" the same airport
      2. Choose the date for flight
      3. Tap the "All flights" or "Top flights"
")

(comment "

      Expected:

      1. The same airport is displayed
      2. Chosen date is displayed
      3. Both airports are highlighted. No search
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

#_(facts
 "The same airport"

 (open-browser page-url)

 (click ($ (:one-way-button page)))

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

 (fact "Open 'Destination' search"
       (click ($ (:to-button page)))

       (wait-element (:airport-input page))

       (type-text "New York" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have NYC element"
             ($-text (:airport-list-element page)) => #"NYC")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "NYC displays in 'From'"
       ($-text (:from-button page)) => #"NYC")

 (fact "NYC displays in 'From'"
       ($-text (:to-button page)) => #"NYC")

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (random-select-date)
       (click ($ (:calendar-done-button page))))

 #_(fact "Tap Top Flights"
       (click ($ (:top-flights page)))
       (when-let [try-again-btn ($ (:try-again-button page))]
         (click try-again-btn)))

 (quit))

