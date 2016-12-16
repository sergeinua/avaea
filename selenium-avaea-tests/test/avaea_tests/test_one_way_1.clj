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
(def page (-> config :pom :one-way))

(fact
 "Search of 'all flights' tickets"
 (open-browser page-url)
 (click ($$ (:from-button page)))
 (fact
  "Focus on input"
  (focused-element-id)) => (:airport-input page)
 (type-text "New York" (focused-element))
 (fact
  "Have NIC element"
  ($-text (:airport-list-element page)) => #"NYC")
 (click ($$ (:airport-list-element page)))
 (fact
  "NYC displays in 'From'"
  ($-text (:from-button page))) => #"NIC"
 (fact
  "Appear drop-down list and 'Cancel' button"
  (click ($$ (:from-button page)))
  (fact
   "Input have NIC text"
   (-> (:airport-input page) $ (attribute "value")) => "NYC"
   (click ($$ (:cancel-button page)))))
 (click ($$ (:to-button page)))
 (fact
  "Focus on input"
  (focused-element-id) => (:airport-input page))
 (type-text "Kiev" (focused-element))
 (fact
  "Have KBP element"
  ($-text (:airport-list-element page)) => #"KBP")
 (click ($$ (:airport-list-element page)))
 (fact
  "KBP displays in 'From'"
  ($-text (:from-button page))) => #"KBP"
 (quit))
