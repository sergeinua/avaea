(ns avaea-tests.test-one-way-c28
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Voice search'

      Steps:

      1. Tap the mic on Search page
      2. Start saying some phrases from Parsers for One way search (for example: I'm in Paris need to fly to Madrid tomorrow)
      3. Tap the 'Continue'
      4. Tap the 'All flights' or 'Top flights'
      5. Check with different parsers including when search should starts automatically

      Expected:

      1. Appear form for voice search with mouse text pointer in the field
      2. Text was parsered and display (I'm in Paris need to fly to Madrid tomorrow)
      3. User is on Search page
      4. Search starts (all flights (sorting by price) or top flights (sorting by smart rank))
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :search))

(facts*
 "Voice search"

 (open-browser page-url)

 (click ($ (:voice-search-button page)))

 (wait-element (:voice-search-text-area page))

 (fact "Continue button is disabled"
       (:voice-search-text-area page) => disabled?)

 (input-text ($ (:voice-search-submit-button page)) "I'm in Paris need to fly to Madrid tomorrow")

 (fact "Continue button is enabled"
       (:voice-search-submit-button page) => enabled?)

 (click (:voice-search-submit-button page))

 (fact "One way"
       (:one-way-button page) => enabled?)

 (fact "PAR displays in 'From'"
       ($-text (:from-button page)) => #"PAR")

 (fact "MAD displays in 'To'"
       ($-text (:to-button page)) => #"MAD")

 (fact "Depart is tomorow"
       ($-text (:depart-button page)) => (re-pattern (str (-> (tomorow) format-as-text remove-spaces))))

 (fact "Tap 'Search' button"
       (click ($ (:search-button page)))

       (wait-elements (:flights-list page))

       (fact "Not Empty"
             ($-elements (as-mondee (:flights-list page))) => not-empty)

       (fact "Have Prices (all flights)"
             ($ (:flights-result-button page)) =not=> nil))

 (quit))

