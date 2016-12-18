(ns avaea.tests.helpers
  (:require [avaea.tests.webdriver :as webdriver]
            [clj-webdriver.taxi :refer :all]
            [midje.sweet :refer :all]
            [clojure.tools.logging :as log]))

(defn open-browser
  "Открывает браузер по переданному url"
  [^String url]
  ;; (println (str "Open driver with profile:" @webdriver/profile-name " and url: " url))
  (webdriver/webdriver-select url))

(defn ->>click
  [& args]
  (apply click args)
  (last args))

(defn ->>keys
  [keycode el]
  (send-keys el keycode) el)

(defn wait
  ([t el] (Thread/sleep t) el)
  ([t] (Thread/sleep t))
  ([] (Thread/sleep 100)))

(defn wait-for-jq-ajax
  "Ожидание завершения всех ajax запросов,
   вызванных jQuery"
  []
  (loop [ajax-active nil]
    (when (not= ajax-active 0)
      (wait)
      (recur @(future (execute-script "return jQuery.active"))))))

(defn $$
  ([selector] ($$ :element selector))
  ([request-type selector]
   ((case request-type
      :element find-element
      :elements find-elements
      :text text
      ) (if (string? selector)
                               {:css selector}
                     selector))))

(defmacro $
  [selector]
  `(if (fact ~(str "Element with selector " selector " not null")
             (exists? ~selector) => true)
     ($$ ~selector)
     nil))

(defmacro $-elements
  [selector]
  `(if (fact ~(str "Elements with selector " selector " not null")
             (exists? ~selector) => true)
     ($$ :elements ~selector)
     nil))

(defmacro $-text
  [selector]
  `(if (fact ~(str "Element with selector " selector " not null")
             (exists? ~selector) => true)
     ($$ :text ~selector)
     nil))

(defn wait-element [selector]
  (wait-until #(and
                (-> selector displayed?)
                (-> selector exists?))))

(defn wait-elements [selector]
  (wait-until #(and
                (-> selector exists?)
                (-> selector displayed?)
                (-> selector elements empty? not))))

(defn wait-any-element [& selector]
  (wait-until (fn [e]
                (reduce
                 (fn [a b]
                   (or a
                       (and
                        (-> b displayed?)
                        (-> b exists?))))
                 selector false))))

(defn x-path [^String selector]
  (find-element {:xpath selector}))

(defn type-text
  "Печатает текст s в елементе el, с задержкой,
   эмуляция ручного ввода"
  ([s el] (type-text s 100 el))
  ([s timeout el]
   (clear el)
   (let [size (count s)]
     (loop [i 0]
       (let [char (str (get s i))]
         (when (< i size)
           (send-keys el char)
           (wait timeout)
           (recur (inc i)))))) el))

(defn multi-type-text
  "Печатает текст асинхронно сразу для нескольких полей ввода
   пример:
       (multi-type-text
          \"RichHickey\" ($ \"#user_login\")
          \"rich@gmail.com\" ($ \"#user_email\")
          \"qwerty\" ($ \"#user_password\"))"
  [& body]
  (let [el-list (apply hash-map body)
        doit (fn [coll s el]
               (let [promise (future (type-text s el) :ok)]
                 (conj coll promise)))
        promises (reduce-kv doit [] el-list)]
    (mapv deref promises)))

(defmacro defwebtest [name url & forms]
  `(deftest ~name
     (open-browser ~url)
     (try
       ~@forms
       (swap! tests-success inc)
       (log/info (var ~name) "test-->ok")
       (is true)
       (catch Throwable t#
         (log/info (var ~name) "test-->fail" (.getMessage t#))
         (swap! tests-fail inc)
         (is false)))))

(defmacro fact-web [legend & forms]
  `(fact
    ~legend
    (try
      ~@forms
      true
      (catch Throwable t#
        (log/info "test-->fail" (.getMessage t#))
        false
        ))
    ))

(defmacro fact-web-2 [legend & forms]
  `(fact
    ~legend
    (do ~@forms) =not=> (throws Throwable)))

(defn focused-element-id
  "Get selected focused element id"
  []
  (some-> (switch-to-active)
          (.getAttribute "id")
          (#(str "#" %))))

(defn focused-element
  "Focused element"
  []
  ($ (focused-element-id)))
