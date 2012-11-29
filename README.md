Product monitor and add-to-cart-er
=============================

Monitors a product's price on Amazon and adds to cart as soon as price drops below threshhold.

Written in [PhantomJS](http://phantomjs.org/) with [CasperJS](http://casperjs.org/) framework.

## Installing PhantomJS and CasperJS

If you're on a Mac, it's quite simple using Homebrew.

```
brew install phantomjs
brew install casperjs
```

You may also download and install each from the websites above.

## Setting up the script

There are fields at the top of the script you will need to modify.

* `priceThreshhold`: This is the dollar amount for which the script will
  add the product to your cart once the price of the product falls below
it.

* `productUrl`: This is the URL to the product page on Amazon.com.

* `refreshInterval`: This is the amount of time the script will wait
  before refreshing the product page when the price is still above the
`priceThreshhold`, in milliseconds. Must be greater than zero.

* `scriptTimeout`: This is the maximum amount of time the script will
  continue reloading the product page and checking the price, in
milliseconds. Once this
amount of time has elapsed, the script will exit. The default value is
for 1 day.

* `loginEmail`: This is the email you login with to Amazon.com.

* `loginPassword`: This is your password.

* `loginName`: This is the first name Amazon has stored for your account.
  It's the name that shows up on the top right of the page when you're
signed in. It's how the script tells whether or not your already signed
in, thus being able to skip the signin step.

## How to run

```
casperjs --cookies-file=cookies.txt --disk-cache=yes casper-scrape.js
```

In the above command, `cookies.txt` can be any filename you want. It's
the plain-text file PhantomJS will use to store the cookie info from
signing in. When you run the script after the first time that file has
been created from the script, you will already be signed in. To sign
out, just delete the cookie file.

## Output

When running the script the first time, you should see output like this:

```
Loading homepage
Checking signed-in status
Going to signin
Signing in
Signed in successfully
Loading product page (try #1 - Wed Nov 28 2012 20:08:12 GMT-0500 (EST))
Checking price
Current price: $999.99 (999.99)
Under threshhold of 800? false
Loading product page (try #2 - Wed Nov 28 2012 20:08:18 GMT-0500 (EST))
Checking price
Current price: $999.99 (999.99)
Under threshhold of 800? false
```

This will continue until the price of the product falls below the
`priceThreshhold`. Once this happens, you'll see this:

```
Checking price
Current price: $688.00 (688.00)
Under threshhold of 800? true
Success! All systems GO!
Adding to cart
Selecting no protection coverage
Clicking edit-cart or proceed-to-checkout
Cart page
Done
```

In addition to all the output to your terminal above, a new directory
called "images" has also been created storing the screen-captures of
each of the steps run by the script. These help to debug if, for
example, signing in isn't working.

Now you should be able to open your browser, sign in, and the product
will be in your cart waiting for you to checkout. You will need to
actually navigate to your cart to see it, as sometimes the cart item
counter in the top right doesn't update until you load the cart page.
But don't worry, it's there.
