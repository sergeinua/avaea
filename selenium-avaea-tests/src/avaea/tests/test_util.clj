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

(defn calendar-dates []
  (->> ($-elements (:calendar-day-elements search-page))
       (filter #(-> % disabled? not))))

(defn random-select-date
  ([] (random-select-date (calendar-dates)))
  ([dates-elements] (-> dates-elements rand-nth click)))

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
