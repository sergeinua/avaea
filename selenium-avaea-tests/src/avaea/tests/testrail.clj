(ns avaea.tests.testrail
  (:require [clj-http.client :as client]
            [avaea.tests.config :refer :all]
            [environ.core :as environ]
            [clojure.string :as string]))

(def testrail-config (-> (read-config) :testrail))

(def browser-name (environ/env :clj-env))

(def system-info
  {:name    (System/getProperty "os.name"),
   :version (System/getProperty "os.version"),
   :arch    (System/getProperty "os.arch")})

(def headers {:content-type :json :accept :json})

(defn- add-last-slash [url]
  (if (string/ends-with? url "/") url (str url "/")))

(defn-  build-url [url]
  (let [base-url (:base-url testrail-config)]
    (str (add-last-slash base-url) "index.php?/api/v2/" url)))

(defn- send-get [url]
  (:body (client/get (build-url url) (merge headers (:auth testrail-config)))))

(defn- send-post [url body]
  (:body (client/post (build-url url) (merge headers (:auth testrail-config) {:form-params body}))))

(defn get-status-id [status-id]
  (if (keyword? status-id)
    (case status-id
      :passed 1
      :blocked 2
      :untested 3
      :retest 4
      :failed 5) status-id))

(defn test-api [test-fn]
  (try
    (test-fn)
    (catch Throwable e (-> e ex-data :body))))

;; -------------------------------------------------------------------------------------

(defn get-run
  "Use the following API methods to request details about test runs and to create or modify test runs."
  [run-id]
  (send-get (str "get_run/" run-id)))

(defn get-runs
  "Returns a list of test runs for a project.
   Only returns those test runs that are not part of a test plan
   (please see get_plans/get_plan for this)."
  [project-id]
  (send-get (str "get_run/" project-id)))

(defn add-run
  "Creates a new test run."
  [project-id {:keys [suite_id name description milestoneid assignedto_id include_all case_id] :as info}]
  (send-post (str "add_run/" project-id) info))

(defn update-run
  "Updates an existing test run (partial updates are supported, i.e. you can submit and update specific fields only)."
  [run-id {:keys [suite_id name description milestoneid assignedto_id include_all case_id] :as info}]
  (send-post (str "update_run/" run-id) info))

(defn close-run
  "Closes an existing test run and archives its tests & results."
  [run-id]
  (send-post (str "close_run/" run-id) {}))

(defn delete-run
  "Deletes an existing test run."
  [run-id]
  (send-post (str "delete_run/" run-id) {}))

(test-api #(delete-run 3))

;; -------------------------------------------------------------------------------------

(defn get-results
  "Returns a list of test results for a test."
  [test-id]
  (send-get (str "get_results/" test-id)))

(defn get-results-for-case
  "Returns a list of test results for a test run and case combination."
  [run-id case-id]
  (send-get (str "get_results_for_case/" run-id "/" case-id)))

(defn get-results-for-run
  "Returns a list of test results for a test run."
  [run-id]
  (send-get (str "get_results/" run-id)))


(defn add-result
  "Adds a new test result, comment or assigns a test.
  It's recommended to use add_results instead if you
  plan to add results for multiple tests."
  [test-id {:keys [status_id comment elapsed defects version assigned_to custom_step_results] :as result}]
  (send-post (str "add_result/" test-id) (merge result {:status_id (get-status-id status_id)})))

(defn add-result-for-case
  "Adds a new test result, comment or assigns a test (for a test run and case combination).
  It's recommended to use add_results_for_cases instead if you plan to add results for multiple test cases.
  The difference to add_result is that this method expects a test run + test case instead of a test.
  In TestRail, tests are part of a test run and the test cases are part of the related test suite.
  So, when you create a new test run, TestRail creates a test for each test case found in
  the test suite of the run.
  You can therefore think of a test as an “instance” of a test case which can have test results,
  comments and a test status. Please also see TestRail's getting started guide for more details about
  the differences between test cases and tests."
  [run-id case-id {:keys [status_id comment elapsed defects version custom_step_results] :as result}]
  (send-post (str "add_result_for_case/" run-id "/" case-id) result))


(defn add-results
  "Adds one or more new test results, comments or assigns one or more tests.
  Ideal for test automation to bulk-add multiple test results in one step."
  [run-id results]
  (send-post (str "add_results/" run-id) results))

(defn add-results-for-cases
  "Adds one or more new test results, comments or assigns one or more tests (using the case IDs).
  Ideal for test automation to bulk-add multiple test results in one step."
  [run-id results]
  (send-post (str "add_results_for_cases/" run-id) results))




