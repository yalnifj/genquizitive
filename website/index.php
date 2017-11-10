<?php
if (strpos($_SERVER['HTTP_HOST'], "genquizlive.com") !== false || strpos($_SERVER['HTTP_HOST'], "live.qenquizitive.com") !== false) {
    header('Location: https://www.genquizitive.com/live/#/live-join-game?'.$_SERVER['QUERY_STRING']);
}
?>
<html>
<head>
	<link rel="icon" type="image/png" sizes="16x16" href="logo_blue_square.png">
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="description" content="GenQuizitive is a fun genealogy quiz game that helps families learn more about their family history as they play together.">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="genquizitive-site.css">
	<title>GenQuizitive</title>
	<script type="text/javascript">
		
	function showContactForm() {
	    $('#contactFormModal').modal('show')
	}

	function validateName() {
	    $('#nameGroup').removeClass('has-error').removeClass('has-success');
	    var name = $('#name').val();
        if (name.trim()=='') {
            $('#nameGroup').addClass('has-error');
            return false;
        } else {
            $('#nameGroup').addClass('has-success');
        }
        return true;
	}

	function validateEmail() {
	    $('#emailGroup').removeClass('has-error').removeClass('has-success');
	    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	    var email = $('#email').val();
        if (!re.test(email)) {
            $('#emailGroup').addClass('has-error');
            return false;
        } else {
            $('#emailGroup').addClass('has-success');
        }
        return true;
	}

	function validateMessage() {
	    $('#messageGroup').removeClass('has-error').removeClass('has-success');
	    var name = $('#message').val();
        if (name.trim()=='') {
            $('#messageGroup').addClass('has-error');
            return false;
        } else {
            $('#messageGroup').addClass('has-success');
        }
        return true;
	}

	function sendContactForm() {
	    $('#ajaxError').hide();
        if (validateName() && validateEmail() && validateMessage()) {
            $.post('contact.php', {
                reasoning: $('#reasoning').val(),
                name: $('#name').val(),
                email: $('#email').val(),
                fhLevel: $("input:radio[name ='fhLevel']:checked").val(),
                message: $('#message').val()
            }, function(data) {
                if (data=='success') {
                    $('#contactFormModal').modal('hide');
                    $('#thankYouModal').modal('show');
                } else {
                    $('#ajaxError').html('There was an error sending your message.' + data).show();
                }
            });
        }
        return false;
	}
</script>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-103628828-1', 'auto');
  ga('send', 'pageview');

</script>
</head>
	
<body>
<section id="page-top">
	<div class="container">
		<div class="row">
			<div class="col-sm-6">
				<div class="road-sign">
                <span class="big-word">GenQuizitive</span> is a <span class="big-word">FUN</span> genealogy quiz game that helps families 
                learn more about their family history as they <span class="big-word">PLAY</span> together.
                </div>
                <div class="socialbuttons">
                    Follow us on social<br />
                    <a class="socialmedia" href="https://www.facebook.com/Genquizitive" title="Visit Genquizitive on Facebook"><i class="fa fa-facebook-square"></i></a>
                    <a class="socialmedia" href="http://www.instagram.com/genquizitive" title="Visit Genquizitive on Instagram"><i class="fa fa-instagram"></i></a>
                    <a class="socialmedia" href="http://www.twitter.com/genquizitive" title="Visit Genquizitive on Twitter"><i class="fa fa-twitter"></i></a>
                </div>
			</div>
			<div class="col-sm-6 text-center top-logo-col">
                <img src="logo-med300.png" class="img-responsive top-logo" />
                <p><a href="/live/"><img src="play-online.png" /></a></p>
			</div>
		</div>
	</div>
</section>
<section id="fh-fun" class="bg-primary text-center" style="margin-top: -20px;">
    <h2>Make Family History FUN!</h2>
    <p>GenQuizitive Live! is an online, live family tree quiz game for parties and small groups.  
        It's great for family reunions!</p>
    <div class="fun-details">
        <h4>PLAY!</h4>
        <p>Play and compete head-to-head with your family to find out who knows the most about your relatives.
        Even if you don't know much about your tree, it is still FUN to play.</p>
    </div>
    <div class="fun-details">
        <h4>LIVE!</h4>
        <p>Everyone can join ONLINE and play together LIVE from anywhere in the world on their own device.
        All that is required is an internet connection and a modern browser.</p>
    </div>
    <div class="fun-details">
        <h4>LEARN!</h4>
        <p>As you play, you will learn more about your relatives and how you are connected to them.
        You will gain a greater knowledge and appreciation of their lives.</p>
    </div>
    <div style="font-size: medium; margin-top: 30px;">
        Learn more about <a href="howtoplay-live.html" style="color: #adf;">How to Play</a> GenQuizitive Live!
    </div>
</section>
<!--
<section id="games" class="bg-primary" style="margin-top: -20px;">
	<div class="text-center" style="font-size: 110%; min-height: 750px; padding-top: 50px; padding-bottom: 50px;">
        <div class="text-left" style="max-width: 750px; padding: 10px; margin-left: auto; margin-right: auto; margin-bottom: 40px;">
            <p>
                GenQuizitive is a suite of games that help make family history fun and engaging
                for everyone.  In GenQuizitive a player might connect to their online family tree
                and answer quiz questions or play other activities about their family.  They may
                also invite friends and family members to play with them.
            </p>
            <p>
                Learn more about the different games below:
            </p>
        </div>
        <div class="col-sm-4 game-block">
			<img src="logo_live_square.png" class="responsive" style="margin: 10px;"  />
			<p>GenQuizitive Live! is an online, live family tree quiz game for parties and small groups.  
                Great for family reunions!</p>
            <p><a class="btn btn-primary" href="howtoplay-live.html">Learn More</a></p>
			<p><a href="/live/"><img src="play-online.png" /></a></p>
		</div>
		<div class="col-sm-4 game-block">
			<a href="howtoplay.html"><img src="logo_blue_square.png" class="responsive" style="margin: 10px;" /></a>
			<p>GenQuizitive Challenge is a social, competitive, mobile game based on your family tree.  Challenge your family and friends!
			</p>
			<p><strong>Coming to iOS and Android Fall 2017!</strong></p>
			<p><a class="btn btn-primary" href="howtoplay.html">Learn More</a></p>
		</div>
		<div class="col-sm-4 game-block">
			<img src="logo_speed_square.png" class="responsive" style="margin: 10px;"  />
			<p>GenQuizitive Speed! is a fast-paced, solitaire family tree relationship game.  How fast can you climb your tree?</p>
			<p><strong>Coming to iOS and Android in Winter 2018!</strong></p>
			<p></p>
		</div>
	</div>
</section>
<div id="video">
					<iframe id="videoiframe" src="https://www.youtube.com/embed/nSe72kCHhes?controls=0&enablejsapi=1" frameborder="0" allowfullscreen=""></iframe>
					<img id="tv" src="old-tv.png" onclick="togglePlaying()" />
					<a id="youtubelink" href="https://www.youtube.com/watch?v=nSe72kCHhes" title="Open video in YouTube"><i class="fa fa-youtube-square" aria-hidden="true"></i></a>
				</div>
                -->

<!-- Partners
<section class="bg-primary" id="partners">
    <a href="#page-top" class="page-scroll to-top" title="back to top"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span></a>
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 text-center">
                <h2 class="section-heading">Partners</h2>
            </div>
        </div>
        <div class="row">
			<div class="col col-sm-6 text-center">
                <h3>Social Accounts We Support</h3>
                <img href="">
                <p>&nbsp;</p>
            </div>
            <div class="col col-sm-6 text-center">
                <h3>Online Family Trees We Support</h3>
                <ul class="partner-list">
                    <li>
                        <a target="_blank" href="https://familysearch.org/apps/product/littlefamilytree/android">
                            <img class="fsicon small-margin" src="FS-Certified.png" border="0"/><br />
                        </a>
                        <a href="familysearch.html">
                            <h4>Learn more about our FamilySearch
                            integration.</h4>
                        </a>
                        <p>&nbsp;</p>
                    </li>
                    <li>
                        <a target="_blank" href="http://www.phpgedview.net"><img src="pgv_logo.png"/> </a>
                    </li>
                </ul>
            </div>
        </div>
</section>
-->
<!-- About -->
<section id="about">
        <div class="row">
            <div class="contact-section col-lg-3 col-lg-offset-2 col-sm-offset-1 col-sm-3 text-center">
				<p>&nbsp;</p>
                <button type="button" onclick="showContactForm(); return false;" class="btn btn-primary">Contact Us!</button>
            </div>
			<div class="contact-section col-lg-3 col-sm-3 text-center">
                <h3>Logo Shirts and More!</h3>
                <a target="_blank" href="https://yellowfork.threadless.com/collections/genquizitive/">
                    <img src="logo-small.png" />
                   <h4>Available through our Threadless store!</h4>
                    <p>&nbsp;</p>
                </a>
            </div>

            <div class="contact-section col-lg-3 col-sm-3 text-center">
                <p>
                    <img src="large_logo.png" border="0" height="120" />
                </p>
                <address><a href="http://www.yellowforktech.com">Yellow Fork Technologies LLC</a>
                <br />5526 W. 13400 S. #448
                <br />Herriman, UT  84096</address>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 text-center">
                <p>Your privacy is extremely important to us.  We promise not to share your personal information.
                    <br /><a href="privacy.html">Read our full privacy policy.</a></p>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 text-center">
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&copy; 2017 Yellow Fork Technologies LLC</p>
                <p>&nbsp;</p>
            </div>
        </div>
</section>

<div id="contactFormModal" class="modal fade bs-example-modal-sm"
    tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" onclick="$('#contactFormModal').modal('hide'); return false;" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Contact GenQuizitive</h4>
      </div>
      <div class="modal-body">
		<p>We would love to hear from you! Please submit the form below
		  to contact us.
		</p>
        <form >
		  <div id="nameGroup" class="form-group">
            <label for="name">Your name</label>
            <input type="text" class="form-control" id="name" placeholder="Name" onchange="validateName();" />
          </div>
		  <div id="emailGroup" class="form-group">
            <label for="email">Email address</label>
            <input type="email" class="form-control" id="email" placeholder="Email" onchange="validateEmail();"/>
          </div>
            <div class="row">
             <div class="form-group col col-sm-5" style="margin-left: 5px;">
                <label>Experience with family history</label>
                <br />
                <label class="radio-inline">
                    <input type="radio" name="fhLevel" id="fhLevel1" value="Beginner" /> Beginner
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fhLevel" id="fhLevel2" value="Intermediate" checked="checked" /> Intermediate
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fhLevel" id="fhLevel3" value="Expert" /> Expert
                </label>
            </div>
			<!--
            <div class="form-group col col-sm-4">
                <label>Social Connection</label>
                <br />
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel1" value="Facebook"> Facebook
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel2" value="Blank" checked="checked" /> Blank
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel3" value="Blank" /> Blank
                </label>
            </div>
			<div class="form-group col col-sm-4">
                <label>Tree Connection</label>
                <br />
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel1" value="FamilySearch"> FamilySearch
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel2" value="Blank" checked="checked" /> Blank
                </label>
                <label class="radio-inline">
                    <input type="radio" name="fsLevel" id="fsLevel3" value="Blank" /> Blank
                </label>
            </div>
			-->
          </div>
            <div class="row">
			<!--
            <div class="form-group col col-sm-5" style="margin-left: 5px;">
                <label>Platform</label>
                <br />
                <label class="radio-inline">
                    <input type="radio" name="platform" id="platform1" value="Android" /> Android
                </label>
                <label class="radio-inline">
                    <input type="radio" name="platform" id="platform2" value="iOS" /> iPhone/iPad
                </label>
            </div>
                <div class="form-group col col-sm-6">
                    <label for="deviceDetails">Device model</label>
                    <input type="text" class="form-control" id="deviceDetails" placeholder="iPhone 5s / Galaxy S3 / etc." />
                </div>
            </div>
			-->
                  <div class="form-group">
                    <label for="reasoning">Reason for contacting us:</label>
                    <select name="reasoning" class="form-control" id="reasoning">
                      <option>I need help</option>
                      <option>I have some feedback to share</option>
                      <option>I found a bug</option>
                      <option>Kudos!</option>
                      <option>Complaint</option>
                    </select>
                  </div>

		  <div id="messageGroup" class="form-group">
            <label for="message">Message</label>
            <textarea rows="6" class="form-control" name="message" id="message" placeholder="Enter your message"></textarea>
          </div>
            <div id="ajaxError" class="form-group has-error bg-danger" style="display: none;">
                There was an error.
            </div>
		</form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" onclick="$('#contactFormModal').modal('hide'); return false;">Close</button>
        <button type="button" class="btn btn-primary" onclick="sendContactForm(); return false;">Send</button>
      </div>
    </div>
  </div>
</div>

<div id="thankYouModal" class="modal fade bs-example-modal-sm"
     tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" onclick="$('#thankYouModal').modal('hide'); return false;" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Thank You!</h4>
            </div>
            <div class="modal-body">
                <p>
                    Thank you for contacting us.
                </p>
                <p>
                    You will receive a copy of the message that was sent
                    to the email address that you provided.
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" onclick="$('#thankYouModal').modal('hide'); return false;">OK</button>
            </div>
        </div>
    </div>
</div>

<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

</body>
	
</html>