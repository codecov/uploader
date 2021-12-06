Michael's notes on gcov so far:

How do we identify which of the various optional args are still required?
Without those we eliminate needing to `exec` user provided input - but I'm not sure how to tell which are required.

Should we nest gcov (and all of it's args below) under -X? Or create a new higher order arg (--gcov) and nest beneath that?

    -g GLOB      Paths to ignore during gcov gathering
    -G GLOB      Paths to include during gcov gathering
    -a gcovargs  extra arguments to pass to gcov

How to handle the requirement to detect a failed upload with gcov? Do we log a warning suggesting the use of the gcov arg if we detect `gcno` files?
