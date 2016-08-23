# USAGE: #

1. See `https://cloud.google.com/natural-language/docs/getting-started`
2. (Perhaps) run `gcloud auth activate-service-account --key-file=Avaea-16ba3a12dc86.json`
3. Run `gcloud auth print-access-token`
4. In `./google_nlp.js` replace the value of variable `_ACCESS_TOKEN` with the output of previous command
5. Make sure that you have empty folder `Responses` in the current work directory
6. Run `./google_nlp.js`. This will call Google NLP API on the Avaea Text Parser Tests we have in `src/tests/fixtures` and write the API responses in folder `Responses`.
7. Run `./read_responses.js *.json`. This will attempt to make sense of Google NLP JSON structures and produce values for `origin_airport`, `return_airport`, `origin_date`, `return_date` etc, dumping the result on STDOUT.
 
In my tests Google NLP API turned to be hard to take advantage of without resorting to RegExps again or without writing lots of heuristical, guesswork and hard to debug code.

Keep trying, though...

