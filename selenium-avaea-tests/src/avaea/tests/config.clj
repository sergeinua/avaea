(ns avaea.tests.config
  (:require [clojure.edn :as edn]))

(defn read-config []
  (edn/read-string (slurp "etc/config.edn")))
