(ns avaea.tests.webdriver
  (:use [clj-webdriver.driver :only [init-driver]])
  (:require [clojure.test :refer :all]
            [clj-webdriver.taxi :refer :all]
            [environ.core :as environ])
  (:import (java.util.concurrent TimeUnit)
           (org.openqa.selenium.remote DesiredCapabilities)))

(def profile-name (atom (environ/env :clj-env)))
(defonce driver (atom nil))

;; PhantomJS and selenium-java java classes conflit resolve
(defmacro webdriver-import []
  (case @profile-name
    "phantomjs" (import '(org.openqa.selenium.phantomjs PhantomJSDriver)
                        '(org.openqa.selenium.phantomjs PhantomJSDriverService))
    "nothing"
    ))

(webdriver-import)

(case (environ/env :clj-env-os)
  "windows" (case @profile-name
              "chrome" (System/setProperty "webdriver.chrome.driver" "chromedriver.exe")
              "phantomjs" (System/setProperty "phantomjs.binary.path" "phantomjs.exe")) nil)

(defmacro webdriver-select [url]
  (case @profile-name
    "chrome"  `(set-driver! {:browser :chrome} ~url)
    "firefox"  `(set-driver! {:browser :firefox} ~url)
    "ie"  `(set-driver! {:browser :ie} ~url)
    "opera"  `(set-driver! {:browser :opera} ~url)
    "phantomjs" `(set-driver! (init-driver
                               {:webdriver
                                (PhantomJSDriver.
                                 (doto (DesiredCapabilities.)
                                   (.setCapability PhantomJSDriverService/PHANTOMJS_CLI_ARGS
                                                   (into-array String ["--webdriver-loglevel=NONE"
                                                                       "--ignore-ssl-errors=yes"
                                                                       "--ssl-protocol=any"]))))}) ~url)))

