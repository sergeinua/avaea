(ns avaea.tests.midje-testrail-plugin
  (:require [avaea.tests.testrail-api :as testrail]
            [environ.core :as environ]
            [midje.data.fact :as fact]
            [midje.emission.plugins
             [default :as default]
             [util :as util]]
            [midje.emission.state :as state]))

(def browser-name (environ/env :clj-env))

(def system-info
  {:name    (System/getProperty "os.name"),
   :version (System/getProperty "os.version"),
   :arch    (System/getProperty "os.arch")})

(defn finishing-top-level-fact [fact]
  (println "!!! finishing-top-level-fact !!!")
  (util/emit-one-line (format "Dude! `%s` at line %d of %s totally finished!"
                              (fact/name fact)
                              (fact/line fact)
                              (fact/file fact)))

  ;; Plugins are not responsible for keeping track of successes and
  ;; failures. That happens independently, and you gain access to the
  ;; counts through the `midje.emission.state` namespace.
  (util/emit-one-line (format "We're up to %d passing checks!"
                              (state/output-counters:midje-passes))))

(defn fail [fact]
  (println "!!! fail !!!")
  (default/fail fact))

(defn future-fact [fact]
  (println "!!! future-fact !!!")
  (default/future-fact fact))

(defn starting-to-check-fact [fact]
  (println "!!! starting-to-check-fact !!!")
  (default/starting-to-check-fact fact))

(defn possible-new-namespace [fact]
  (println "!!! possible-new-namespace !!!")
  (default/possible-new-namespace fact))

(defn finishing-fact-stream [midje-counters clojure-test-map]
  (println "!!! finishing-fact-stream !!!")
  (default/finishing-fact-stream midje-counters clojure-test-map))

(defn starting-fact-stream []
  (println "!!! starting-fact-stream !!!")
  (default/starting-fact-stream))

(def emission-map (assoc default/emission-map
                         :finishing-top-level-fact finishing-top-level-fact
                         :fail fail
                         :future-fact future-fact
                         :starting-to-check-fact starting-to-check-fact
                         :possible-new-namespace possible-new-namespace
                         :finishing-fact-stream finishing-fact-stream
                         :starting-fact-stream starting-fact-stream))

(state/install-emission-map emission-map)
