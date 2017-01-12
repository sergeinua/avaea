(ns avaea-tests.test-general-c41
  (:require [avaea.tests.webdriver :refer :all]
            [avaea.tests.helpers :refer :all]
            [avaea.tests.test-util :refer :all]
            [clojure.test :refer :all]
            [midje.sweet :refer :all]
            [clj-webdriver.taxi :refer :all]
            [avaea.tests.config :refer :all]))

(comment "

      'Saving Profile'

      Steps:

      1. Tap the hamburger menu
      2. Tap the menu profile
      3. Enter values to the fields (for example change name, last name, etc)
      4. Tap the 'Update' button
      5. Go to ABO -> search for user -> user profile

      Expected:

      1. Hanmburger with menu opened
      2. Appear profile with added values before
      3. New values are displaying
      4. New information is present in Profile
      5. Entered info is displaying
")

(def config (read-config))
(def page-url (-> config :server-root (str "/search")))
(def menu (-> config :pom :menu))

(facts*
 "(C41) Saving Profile"

 (open-browser page-url)

 (click ($ (:profile-menu-button menu)))



 (quit))
