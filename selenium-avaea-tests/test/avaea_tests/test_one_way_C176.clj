(ns avaea-tests.test-one-way-c176
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Search of 'all flights' tickets using Mondee'

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
 "(C176) Search of 'all flights' tickets using Mondee"

 (open-browser page-url)

 (click ($ (:one-way-button page)))

 (fact "One way button is active"
       ($ (:one-way-button page)) => active?)

 (assign-from-airport {:search-text "New York" :airport "NYC"})
 (assign-to-airport {:search-text "Kiev" :airport "KBP"})

 (fact "Tap the Calendar and choose any date"
       (click ($ (:depart-button page)))
       (select-random-date)
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
             ($ (:flights-price-button page)) =not=> nil)

       #_(fact "Click first element"
             (click ($ (:flights-list page))))

       #_(click ($ (:flights-price-button page)))

       #_(when-let [try-again-btn ($ (:try-again-button page))]
           (click try-again-btn)))


 (quit))