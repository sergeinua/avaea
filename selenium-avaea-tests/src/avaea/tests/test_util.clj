(ns avaea.tests.test-util
  (:require [avaea.tests.helpers :refer :all]
            [midje.sweet :refer :all]
            [avaea.tests.config :refer :all]
            [clj-webdriver.taxi :refer :all]
            [clj-time.core :as t]
            [clj-time.format :as f]))

(def ^:private search-page (-> (read-config) :pom :search))

(defn disabled? [el]
  (->> (-> el (attribute "class"))
       (re-find #"disabled")))

(defn active? [el]
  (->> (-> el (attribute "class"))
       (re-find #"active")))

(defn parse-date [date-string]
  (f/parse (f/formatter "MM/dd/YYYY") date-string))

(defn date-from-element [el]
  #_(let [date-attr (attribute el "data-day")
          date-time (parse-date date-attr)]
      date-time)
  (attribute el "data-day"))

(defn calendar-dates [after]
  (->> ($-elements (:calendar-day-elements search-page))
       (filter #(and
                 (-> % disabled? not)
                 #_(let [el-date (date-from-element %)]
                   (println el-date "after" after "=>" (t/after? (parse-date el-date) (parse-date after))) true)
                 (-> % date-from-element parse-date (t/after? (parse-date after)))))))

(defn random-select-date
  ([] (random-select-date "1/1/1972"))
  ([after & config]
   (let [remove-first (if ((set config) :not-first) rest identity)
         remove-last (if ((set config) :not-last) drop-last identity)
         date-button (-> (calendar-dates after) remove-first remove-last rand-nth)
         date-time (-> date-button date-from-element)]
     (-> date-button click)
     date-time)))

(defn random-select-date-range []
  (let [date-from (random-select-date "1/1/1972" :not-last)
        date-to (random-select-date date-from)]
    [date-from date-to]))

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
