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

(defn build-url
  [& parts]
  (let [url (string/join "/"
                         (map (fn [part]
                                (if (string? part)
                                  part
                                  (str "?" (string/join "&"
                                                     (for [[k v] part]
                                                       (str (name k) "=" v))))))
                              (filter #(-> % empty? not) parts)))]
    url))

;; -------------------------------------------------------------------------------------

(defn get-run
  "Use the following API methods to request details about test runs and to create or modify test runs."
  [run-id]
  (send-get (build-url "get_run" run-id)))

(defn get-runs
  "Returns a list of test runs for a project.
   Only returns those test runs that are not part of a test plan
   (please see get_plans/get_plan for this)."
  [project-id]
  (send-get (build-url "get_run" project-id)))

(defn add-run
  "Creates a new test run."
  [project-id {:keys [suite_id name description milestoneid assignedto_id include_all case_id] :as info}]
  (send-post (build-url "add_run" project-id) info))

(defn update-run
  "Updates an existing test run (partial updates are supported, i.e. you can submit and update specific fields only)."
  [run-id {:keys [suite_id name description milestoneid assignedto_id include_all case_id] :as info}]
  (send-post (build-url "update_run" run-id) info))

(defn close-run
  "Closes an existing test run and archives its tests & results."
  [run-id]
  (send-post (build-url "close_run" run-id) {}))

(defn delete-run
  "Deletes an existing test run."
  [run-id]
  (send-post (build-url "delete_run" run-id) {}))

;; -------------------------------------------------------------------------------------

(defn get-case
  "Use the following API methods to request details about test cases and to create or modify test cases."
  [case-id]
  (send-get (build-url "get_case" case-id)))

(defn get-cases
  "Returns a list of test cases for a test suite or specific section in a test suite."
  [project-id {:keys [suite_id section_id created_after created_before] :as filter}]
  (send-get (build-url "get_case" project-id (map-to-get-params filter))))

(defn add-case
  "Creates a new test case."
  [project-id {:keys [] :as info}]
  (send-post (build-url "add_case" project-id) info))

(defn update-case
  "Updates an existing test case (partial updates are supported, i.e. you can submit and update specific fields only)."
  [case-id {:keys [] :as info}]
  (send-post (build-url "update_case" case-id) info))

(defn close-case
  "Closes an existing test case and archives its tests & results."
  [case-id]
  (send-post (build-url "close_case" case-id) {}))

(defn delete-case
  "Deletes an existing test case."
  [case-id]
  (send-post (build-url "delete_case" case-id) {}))

;; -------------------------------------------------------------------------------------

(defn get-case-fields
  "Returns a list of available test case custom fields."
  []
  (send-get "get_case_fields"))

(defn get-case-types
  "Returns a list of available test case custom types."
  []
  (send-get "get_case_types"))

;; -------------------------------------------------------------------------------------

(defn get-project
  "Use the following API methods to request details about test projects and to create or modify test projects."
  [project-id]
  (send-get (build-url "get_project" project-id)))

(defn get-projects
  "Returns a list of test projects for a project.
   Only returns those test projects that are not part of a test plan
   (please see get_plans/get_plan for this)."
  [project-id]
  (send-get (build-url "get_project" project-id)))

(defn add-project
  "Creates a new test project."
  [project-id {:keys [suite_id name description milestoneid assignedto_id include_all project_id] :as info}]
  (send-post (build-url "add_project" project-id) info))

(defn update-project
  "Updates an existing test project (partial updates are supported, i.e. you can submit and update specific fields only)."
  [project-id {:keys [suite_id name description milestoneid assignedto_id include_all project_id] :as info}]
  (send-post (build-url "update_project" project-id) info))

(defn delete-project
  "Deletes an existing test project."
  [project-id]
  (send-post (build-url "delete_project" project-id) {}))

;; -------------------------------------------------------------------------------------

(defn get-suite
  "Returns an existing test suite."
  [suite-id]
  (send-get (build-url "get_suite" suite-id)))

(defn get-suites
  "Returns a list of test suites for a project."
  [project-id {:keys [suite_id section_id created_after created_before] :as filter}]
  (send-get (build-url "get_suite" project-id (map-to-get-params filter))))

(defn add-suite
  "Creates a new test suite."
  [project-id {:keys [] :as info}]
  (send-post (build-url "add_suite" project-id) info))

(defn update-suite
  "Updates an existing test suite (partial updates are supported,
   i.e. you can submit and update specific fields only)."
  [suite-id {:keys [] :as info}]
  (send-post (build-url "update_suite" suite-id) info))

(defn delete-suite
  "Deletes an existing test suite."
  [suite-id]
  (send-post (build-url "delete_suite" suite-id) {}))

;; -------------------------------------------------------------------------------------

(defn get-test
  "Returns an existing test."
  [test-id]
  (send-get (build-url "get_test" test-id)))

(defn get-tests
  "Returns a list of test tests for a project."
  [run-id]
  (send-get (build-url "get_test" run-id (map-to-get-params filter))))

;; -------------------------------------------------------------------------------------

(defn get-results
  "Returns a list of test results for a test."
  [test-id]
  (send-get (build-url "get_results" test-id)))

(defn get-results-for-case
  "Returns a list of test results for a test run and case combination."
  [run-id case-id]
  (send-get (build-url "get_results_for_case" run-id case-id)))

(defn get-results-for-run
  "Returns a list of test results for a test run."
  [run-id]
  (send-get (build-url "get_results" run-id)))

(defn add-result
  "Adds a new test result, comment or assigns a test.
  It's recommended to use add_results instead if you
  plan to add results for multiple tests."
  [test-id {:keys [status_id comment elapsed defects version assigned_to custom_step_results] :as result}]
  (send-post (build-url "add_result" test-id) (merge result {:status_id (get-status-id status_id)})))

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
  (send-post (build-url "add_result_for_case" run-id case-id) result))


(defn add-results
  "Adds one or more new test results, comments or assigns one or more tests.
  Ideal for test automation to bulk-add multiple test results in one step."
  [run-id results]
  (send-post (str "add_results" run-id) results))

(defn add-results-for-cases
  "Adds one or more new test results, comments or assigns one or more tests (using the case IDs).
  Ideal for test automation to bulk-add multiple test results in one step."
  [run-id results]
  (send-post (build-url "add_results_for_cases" run-id) results))



