(ns avaea-tests.test-one-way-1
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
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

(defonce config (read-config))

(fact
 "Search of 'all flights' tickets using Mondee"
 ;; (open-browser (-> config :server-root (str "/search")))
 (let [page-model  (-> config :pom :one-way)
       from-button ($$ (:from-button page-model))]
   ;; (click from-button)
   #_(quit)))

