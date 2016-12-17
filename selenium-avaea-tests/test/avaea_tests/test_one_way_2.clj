(ns avaea-tests.test-one-way-2
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      Steps:


")

(comment "

      Expected:

")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def page (-> config :pom :one-way))

(fact
 "Search of 'all flights' tickets"

 (open-browser page-url)


 (quit))


(ns avaea-tests.test-one-way-2)

