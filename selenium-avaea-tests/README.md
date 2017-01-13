# Selenium Avaea Tests

### Install 

#### Drivers

    http://www.seleniumhq.org/download/

#### Windows

    Copy drivers to test project root

#### Mac Os
    
    $ brew install chromedriver
    $ brew install geckodriver

#### Safari

    http://selenium-release.storage.googleapis.com/index.html?path=2.48/

### Run Tests

#### Default (chrome)

    $ lein midje
    $ lein with-profile +windows midje

#### Specific browser

    $ lein with-profile firefox midje

#### Specific browser (windows)

    $ lein with-profile windows,ie midje

#### Specific test (namespace)

    $ lein midje test.avaea-tests.test-one-way-1

#### Change log level

    $ lein midje :print-namespaces
