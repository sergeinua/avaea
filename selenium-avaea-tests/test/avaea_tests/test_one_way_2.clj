(ns avaea-tests.test-one-way-2
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      Steps:

      Precondition: User is logged in and he is on " One Way " tab.
      Farelogix sells tickets only in Canada and some big airports of USA

      1. Tap the " From "
      2. Start typing the city (for example Toronto)
      3. Tap the YTO airport
      4. Tap the " To "
      5. Start typing the city (for example Montreal)
      6. Tap the YMQ
      7. Tap the Calendar and choose any date
      8. Tap the " All flights "
      9. Check with different quantity of " Class " and " Passengers "
")

(comment "

      Expected:

      1. Appear drop-down list and " Cancel " button
      2. Search starts looking for (code -> airport name-> city->country)
      3. YTO displays in " From "
      4. Appear drop-down list and " Cancel " button
      5. Search starts looking for (code -> airport name-> city->country)
      6. YMQ displays in " To "
      7. Tap tomorrow day
      8. Appear list of tickets. Go to server logs and see that search was done using Farelogix
      9. Appear list of tickets, where at the top displays correct class and quantity of passengers.
         For the first class will display (" The first " class)
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts
 "Search of 'all flights' tickets using Farelogix"

 (open-browser page-url)

 (click ($ (:one-way-button page)))

 (fact "Open 'From' Search"

       (click ($ (:from-button page)))

       (wait-element (:airport-input page))

       (fact "Focus on input"
             (focused-element-id) => (:airport-input page))

       (type-text "Toronto" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have YTO element"
             ($-text (:airport-list-element page)) => #"YTO")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "YTO displays in 'From'"
       ($-text (:from-button page)) => #"YTO")

 ;; 'cancel' button bug
 #_(fact "Appear drop-down list and 'Cancel' button"
       (click ($ (:from-button page)))
       (fact "Input have YTO text"
             (-> (:airport-input page) $ (attribute "value")) => "YTO"
             (click ($ (:cancel-button page)))))

 (fact "Open 'Destination' search"
       (click ($ (:to-button page)))

       (wait-element (:airport-input page))

       (fact "Focus on input"
             (focused-element-id) => (:airport-input page))

       (type-text "Montreal" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have YMQ element"
             ($-text (:airport-list-element page)) => #"YMQ")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "YMQ displays in 'From'"
       ($-text (:to-button page)) => #"YMQ")

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (random-select-date)
       (click ($ (:calendar-done-button page))))

 (test-class-buttons)
 (test-passengers-buttons)

 (fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-list page))

       (fact "Not Empty"
             ($-elements (:flights-list page)) => not-empty))

 (quit))
