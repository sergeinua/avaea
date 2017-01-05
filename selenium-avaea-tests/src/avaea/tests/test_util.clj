(ns avaea.tests.test-util
  (:require [avaea.tests.helpers :refer :all]
            [midje.sweet :refer :all]
            [avaea.tests.config :refer :all]
            [clj-webdriver.taxi :refer :all]))

(def ^:private search-page (-> (read-config) :pom :search))

(defn disabled? [el]
  (->> (-> el (attribute "class"))
       (re-find #"disabled")))

(defn active? [el]
  (->> (-> el (attribute "class"))
       (re-find #"active")))

(defn calendar-dates [after]
  (->> ($-elements (:calendar-day-elements search-page))
       (filter #(and
                 (-> % disabled? not)
                 (-> % text read-string (> after))))))

(defn random-select-date
  ([] (random-select-date 0))
  ([after]
   (let [date-button (-> (calendar-dates after) rand-nth)
         date-number (-> date-button text read-string)]
     (-> date-button click)
     date-number)))

(defn test-class-buttons []
  (fact "Tap Class"
        ($-text (:class-button search-page)) => "Economy"

        (click ($ (:class-button search-page)))
        ($-text (:class-button search-page)) => "Premium"

        (click ($ (:class-button search-page)))
        ($-text (:class-button search-page)) => "Business"

        (click ($ (:class-button search-page)))
        ($-text (:class-button search-page)) => "First"

        (click ($ (:class-button search-page)))
        ($-text (:class-button search-page)) => "Economy"))

(defn as-mondee [selector]
  (str selector (:mondee-marker search-page)))

(defn as-farelogix [selector]
  (str selector (:farelogix-marker search-page)))

(defn test-passengers-buttons []
  (fact "Tap Passengers"
        ($-text (:passengers-button search-page)) => "One Adult"

        (click ($ (:passengers-button search-page)))
        ($-text (:passengers-button search-page)) => "Two Adults"

        (click ($ (:passengers-button search-page)))
        ($-text (:passengers-button search-page)) => "Three Adults"

        (click ($ (:passengers-button search-page)))
        ($-text (:passengers-button search-page)) => "Four Adults"

        (click ($ (:passengers-button search-page)))
        ($-text (:passengers-button search-page)) => "One Adult"))
