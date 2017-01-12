(ns avaea.tests.test-util
  (:require [avaea.tests.helpers :refer :all]
            [midje.sweet :refer :all]
            [avaea.tests.config :refer :all]
            [clj-webdriver.taxi :refer :all]
            [clj-time.core :as t]
            [clj-time.format :as f]
            [clojure.string :as string])
  (:import [org.joda.time LocalDate LocalTime]))

(def search-page (-> (read-config) :pom :search))
(def profile-form (-> (read-config) :pom :profile-form))

(def slash-formater (f/formatter "MM/dd/YYYY"))
(def depart-formater (f/formatter "dd MMM YYYY"))

(defn disabled? [el]
  (->> (-> el (attribute "class"))
       (re-find #"disabled")))

(defn active? [el]
  (->> (-> el (attribute "class"))
       (re-find #"active")))

(defn parse-date [date-string]
  (f/parse slash-formater date-string))

(defn date-from-element [el]
  (attribute el "data-day"))

(defn calendar-dates
  ([] (calendar-dates "01/01/1970"))
  ([after]
  (->> ($-elements (:calendar-day-elements search-page))
       (filter #(and
                 (-> % disabled? not)
                 (-> % date-from-element parse-date (t/after? (parse-date after))))))))

(defn select-date [^String date-string]
  (let [filter-fn (fn [elems] (filter #(-> % date-from-element (= date-string)) elems))
        date-button (-> (calendar-dates) filter-fn first)]
    (-> date-button click)
    date-string))

(defn select-random-date
  ([] (select-random-date "01/01/1970"))
  ([after & config]
   (let [remove-first (if ((set config) :not-first) rest identity)
         remove-last (if ((set config) :not-last) drop-last identity)
         date-button (-> (calendar-dates after) remove-first remove-last rand-nth)
         date-time (-> date-button date-from-element)]
     (-> date-button click)
     date-time)))

(defn select-random-date-range []
  (let [date-from (select-random-date "01/01/1970" :not-last)
        date-to (select-random-date date-from)]
    [date-from date-to]))

(defn format-as-slashes [t]
  (f/unparse-local slash-formater t))

(defn format-as-text [t]
  (f/unparse-local depart-formater t))

(defn today []
  (t/today))

(defn today-str []
  (format-as-slashes (today)))

(defn tomorow []
  (-> (t/today) (t/plus (t/days 1))))

(defn tomorow-str []
  (format-as-slashes (tomorow)))

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

(defn remove-spaces [s]
  (-> s (string/replace #"\s" "")))

(defmacro assign-from-airport [{:keys [search-text airport]}]
  `(fact "Open 'From' Search"

         (click ($ (:from-button search-page)))

         (wait-element (:airport-input search-page))

         (fact "Focus on input"
               (focused-element-id) => (:airport-input search-page))

         (type-text ~search-text (focused-element))

         (wait-elements (:airport-list-element search-page))

         (fact "Check airport"
               ($-text (:airport-list-element search-page)) => (re-pattern ~airport))

         (fact "Select first result and go home"
               (click ($ (:airport-list-element search-page))))

         (fact "Check value displays in 'From'"
               ($-text (:from-button search-page)) => (re-pattern ~airport))))

(defmacro assign-to-airport [{:keys [search-text airport]}]
  `(fact "Open 'Destination' search"

        (click ($ (:to-button search-page)))

        (wait-element (:airport-input search-page))

        (fact "Focus on input"
              (focused-element-id) => (:airport-input search-page))

        (type-text ~search-text (focused-element))

        (wait-elements (:airport-list-element search-page))

        (fact "Check airport"
              ($-text (:airport-list-element search-page)) => (re-pattern ~airport))

        (fact "Select first result and go home"
              (click ($ (:airport-list-element search-page))))

        (fact "Check value displays in 'From'"
              ($-text (:to-button search-page)) => (re-pattern ~airport))))
