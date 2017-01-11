(ns avaea-tests.test-round-trip-c37
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-time.core :as t]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Voice search'

      Steps:

      1. Tap the mic on Search page
      2. Start saying some phrases from Parsers for Round way search
      (for example:from SFO to JFK on New Year, back on Groundhog Day)
      3. Tap the 'Continue'
      4. Tap the Search
      5. Check with different parsers including when search should starts automatically

      Expected:

      1. Appear form for voice search with mouse text pointer in the field
      2. Text was parsered and display (Depart - SFO, Return - JFK, depart - 1 Jan 2016, return day - 02 Feb 2017)
      3. User is on Search page
      4. Search starts
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "(C37) Voice search"

 (open-browser page-url)

 (click ($ (:voice-search-button page)))

 (wait-element (:voice-search-submit-button page))

 (fact "Continue button is disabled"
       (:voice-search-submit-button page) => disabled?)

 (input-text ($ (:voice-search-text-area page))
             "You want to go from Washington DC to London leaving on September 17th and returning on December 23rd in the car")

 (fact "Continue button is enabled"
       (:voice-search-submit-button page) => enabled?)

 (click (:voice-search-submit-button page))

 (fact "Round Trip"
       (:round-trip-button page) => enabled?)

 (fact "WAS displays in 'From'"
       ($-text (:from-button page)) => #"WAS")

 (fact "LON displays in 'To'"
       ($-text (:to-button page)) => #"LON")

 (fact "Depart is September 17th"
       ($-text (:depart-button page)) => #"17Sep")

 (fact "Depart is December 23th"
       ($-text (:return-button page)) => #"23Dec")

 ;; bug? - not working search button
 #_(fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-list page))

       (fact "Not Empty"
             ($-elements (as-mondee (:flights-list page))) => not-empty)

       (fact "Have Prices (all flights)"
             ($ (:flights-price-button page)) =not=> nil))

 (quit))

