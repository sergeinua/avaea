# Selenium Avaea Tests

### Install Drivers

    http://www.seleniumhq.org/download/

#### windows

    Copy drivers to test project root

#### macos
    
    $ brew install chromedriver
    $ brew install geckodriver

### Run Tests

#### Default (chrome)

    $ lein midje
    $ lein midje +windows

#### Specific browser

    $ lein with-profile ie midje

#### Specific browser

    $ lein with-profile ie midje

#### Specific test (namespace)

    $ lein midje test.avaea-tests.test-one-way-1

#### Change log level

    $ lein midje :print-namespaces
