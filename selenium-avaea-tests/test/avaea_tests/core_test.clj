(ns avaea-tests.core-test
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]))

#_(fact
 "Open google page and search Petrovac city"
 (open-browser "http://google.com")
 (focused-element-id) => "#lst-ib"
 (type-text "Petrovac na moru" (focused-element))
 (submit (focused-element))
 (wait 2000)
 (quit))
