(ns avaea-tests.test-one-way-01
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      Steps:

      Precondition: User is logged in and he is on 'One Way' tab
      1. Tap the 'From'
      2. Start typing the city (for example New-York)
      3. Tap the NYC airport
      4. Tap the 'To'
      5. Start typing the city (for example Kiev)
      6. Tap the KBP
      7. Tap the Calendar and choose any date
      8. Tap the 'All flights'
      9. Check with different quantity of 'Class' and 'Passengers'

")

(comment "

      Expected:

      1. Appear drop-down list and 'Cancel' button
      2. Search starts looking for (code -> airport name-> city->country)
      3. NYC displays in 'From'
      4. Appear drop-down list and 'Cancel' button
      5. Search starts looking for (code -> airport name-> city->country)
      6. KBP displays in 'To'
      7. Tap tomorrow day
      8. Appear list of tickets. Go to server logs and see that search was done using Mondee
      9. Appear list of tickets, where at the top displays correct class
         and quantity of passengers. For the first class will display ('The first' class)
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "Search of 'all flights' tickets using Mondee"

 (open-browser page-url)

 (click ($ (:one-way-button page)))

 (fact "One way button is active"
       ($ (:one-way-button page)) => active?)

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

 #_(fact "Appear drop-down list and 'Cancel' button"
       (click ($ (:from-button page)))
       (fact "Input have NYC text"
             (-> (:airport-input page) $ (attribute "value")) => "NYC"
             (click ($ (:cancel-button page)))))

 (fact "Open 'Destination' search"
       (click ($ (:to-button page)))

       (wait-element (:airport-input page))

       (fact "Focus on input"
             (focused-element-id) => (:airport-input page))

       (type-text "Kiev" (focused-element))

       (wait-elements (:airport-list-element page))

       (fact "Have KBP element"
             ($-text (:airport-list-element page)) => #"KBP")

       (fact "Select first result and go home"
             (click ($ (:airport-list-element page)))))

 (fact "KBP displays in 'From'"
       ($-text (:to-button page)) => #"KBP")

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (random-select-date)
       (click ($ (:calendar-done-button page))))

 (fact "One way button is active"
       ($ (:one-way-button page)) => active?)

 (test-passengers-buttons)
 (test-class-buttons)

 (fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-list page))

       (fact "Not Empty"
             ($-elements (as-mondee (:flights-list page))) => not-empty)

       (fact "Have Prices (all flights)"
             ($ (:flights-result-button page)) =not=> nil)

       #_(fact "Click first element"
             (click ($ (:flights-list page))))

       #_(click ($ (:flights-result-button page)))

       #_(when-let [try-again-btn ($ (:try-again-button page))]
           (click try-again-btn)))


 (quit))
