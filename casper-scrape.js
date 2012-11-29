var casper = require('casper').create();

var priceThreshhold = 900.00, // this would be $900.00
    productUrl = "", // full URL to specific product page
    refreshInterval = 5, // in ms
    scriptTimeout = 86400000, // 1 day in ms
    loginEmail = "",
    loginPassword = "",
    loginName = ""; // login name as it appears at top of Amazon.com when logged in

var timestamp = function() {
  return (new Date((new Date().getTime() / 1000) * 1000));
};

//----------------------------------------------------------------------------
// Click functions
//----------------------------------------------------------------------------

var clickEl = function(el) {
  // make it look like user interaction... just in case
  this.mouse.move(el);
  return this.click(el);
};

var clickElAndWait = function(el, callback) {
  var url = this.getCurrentUrl();
  clickEl.call(this, el);
  if (typeof callback === "function") {
    return callback.call(this);
  } else {
    return this.waitFor(function() {
      return url !== this.getCurrentUrl();
    });
  }
};

//----------------------------------------------------------------------------
// Get started
//----------------------------------------------------------------------------

casper.start();

// This is necessary for Amazon to detect cookies properly
casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11");

//----------------------------------------------------------------------------
// Amazon Homepage
//----------------------------------------------------------------------------

casper.thenOpen('http://www.amazon.com', function() {
  this.echo("Loading homepage");
});

//----------------------------------------------------------------------------
// Log in if necessary
//----------------------------------------------------------------------------

casper.then(function() {
  this.echo("Checking signed-in status");
  var signedin = this.fetchText("#nav-signin-text") == loginName ? true : false;

  if (!signedin) {
    this.echo("Going to signin");
    var image = 'images/1-clicktologin.png';
    this.mouse.move("#nav-your-account");
    this.mouseEvent('mouseover', '#nav-your-account');
    this.waitUntilVisible("#nav_your_account_flyout", function() {
      this.echo("Signing in");
      clickElAndWait.call(this, "#nav_your_account_flyout a span.nav-action-inner.nav-sprite", function() {
        this.waitUntilVisible("#ap_signin_existing_radio", function() {
          clickEl.call(this, "#ap_signin_existing_radio");

          var image = 'images/2-login.png';
          this.waitUntilVisible("#ap_password", function() {
            var url = this.getCurrentUrl();
            this.fill('#ap_signin_form', { email: loginEmail, password: loginPassword }, true);
            this.capture(image);
            this.waitFor(function() {
              return url !== this.getCurrentUrl();
            }, function() {
              this.echo("Signed in successfully");
            }, function() {
              var image = 'images/2b-loggedin.png';
              this.echo("! Timed out waiting for new page - see " + image);
              this.capture(image);
            });
          }, function() {
            this.capture(image);
            this.echo("! Timed out waiting for password field - see " + image);
            this.exit();
          });
        }, function() {
          this.echo("! Timed out waiting for existing-account-radio");
        });
      });
    }, function() {
      this.capture(image);
      this.echo("! Timed out waiting for account dropdown - see" + image);
    });
  } else {
    this.echo("Already logged in");
  }
});

//----------------------------------------------------------------------------
// Recursively load product page and check price
//----------------------------------------------------------------------------

var underThreshhold,
    numberOfTries = 0;

var loadPageAndCheckPrice = function() {
  casper.thenOpen(productUrl, function() {
    numberOfTries ++;
    var now = timestamp();
    this.echo("Loading product page (try #" + numberOfTries + " - " + now + ")");
    this.capture('images/3-product-page.png');

    this.echo("Checking price");

    var currentPrice = this.fetchText("#actualPriceValue"),
        parsed = parseFloat(currentPrice.match(/[\d\.]+/));

    underThreshhold = parsed <= priceThreshhold;

    this.echo("Current price: " + currentPrice + " (" + parsed + ")");
    this.echo("Under threshhold of " + priceThreshhold + "? " + underThreshhold);

    if (!underThreshhold) {
      casper.wait(refreshInterval, loadPageAndCheckPrice);
    }
  });
};

casper.then(function() {
  loadPageAndCheckPrice.call(this);
  this.waitFor(function() {
    return underThreshhold;
  }, function() {
    // continue with adding to cart when price is under priceThreshhold
    this.echo("Success! All systems GO!", "INFO");
  }, function() {
    this.echo("! SCRIPT TIMED OUT", "WARNING");
  }, scriptTimeout);
});

//----------------------------------------------------------------------------
// Add it to cart
//----------------------------------------------------------------------------

casper.then(function() {
  this.echo("Adding to cart");
  var image = 'images/3b-page-adding.png';

  if (this.exists('#bb_atc_button')) {
    clickEl.call(this, "#bb_atc_button");
  } else {
    clickElAndWait.call(this, "#goldBoxBuyBoxDivId a", function() {
      this.waitUntilVisible("#100_dealView" + dealViewNumber + " #dealActionButton", function() {
        clickEl.call(this, "#100_dealView" + dealViewNumber + " #dealActionButton");
      });
    });
  }
});

casper.then(function() {
  // Select no protection coverage if prompted
  // If not prompted, it'll just timeout and continue
  // (which is no biggie, because if that's the case,
  // then the item must already be in the cart and saved.
  this.echo("Selecting no protection coverage");
  var image = 'images/3c-protection-coverage.png';
  // coverage popup
  this.waitUntilVisible("#siNoCoverage", function() {
    this.capture(image);
    clickElAndWait.call(this, "#siNoCoverage");
  }, function() {
    this.capture(image);
    this.echo("! Timed out waiting for protection-coverage button - see " + image);
    this.exit();
  });
});

//----------------------------------------------------------------------------
// Edit cart, just to make sure
//----------------------------------------------------------------------------

casper.then(function() {
  this.echo("Clicking edit-cart or proceed-to-checkout");
  var image = "images/4-edit-proceed.png";

  // proceed to checkout
  //var button = ".hucSprite.s_checkout.hlb-checkout-button";
  // edit cart
  var button = ".hucSprite.s_editCart.hlb-cart-button";

  this.waitUntilVisible(button, function() {
    this.capture(image);
    clickElAndWait.call(this, button);
  }, function() {
    this.capture(image);
    this.echo("! Timed out waiting for edit-cart button - see " + image);
    this.exit();
  });
});

//----------------------------------------------------------------------------
// Print cart page
//----------------------------------------------------------------------------

casper.then(function() {
  this.echo("Cart page");
  this.capture('images/5-cart.png');
});

//----------------------------------------------------------------------------
// Run this shit
//----------------------------------------------------------------------------

casper.run(function() {
  this.echo("Done", "INFO");
  this.exit();
});
