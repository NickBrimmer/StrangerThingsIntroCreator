const $ = require('jquery');

import swal from 'sweetalert2';
import ajaxErrorFunction from 'errorFunction';

const donationMinimum = 10;

const calcTime = function(queue){
  let minutes = (queue+1)*50;
  let hours = Math.floor(minutes/60);
  let days = Math.floor(hours/24);
  let time = "";
  if(days > 0){
    time += days + " days";
  }
  if(days < 3){
    hours = hours%24;
    minutes = minutes%60;
    if(hours > 0){
      time += " " +hours + " hours";
    }
    if(minutes > 0){
      time += " " +minutes + " minutes";
    }
  }
  return time;
};

const paymentPageUrl = 'https://payment.kassellabs.io/';

const requestVideo = function(donate,key, email){
  if(email === false) return false;

  var url = "https://upsidedown.kassellabs.io/request?code="+ key +"&email=" + email;
  $.ajax({
    url: url,
    type: 'GET',
    crossDomain: true,
    success: function(data){
      var queue = data.queue;
      swal({
        title: '<h2>Video Request Sent</h2>',
        html:'<p>'+
                'Your video has been queued. Your current position on the queue is <b>'+
                (queue+1) + '</b>, which will take up to <b>'+ calcTime(queue) +'</b>.<br>'+
                'The link to download the video will be sent to the e-mail:<br>'+
                '</p><span class="email">'+email+'</span>'+
                (
                  donate ?
                  (
                   '<p style="margin-top: 15px;">But as you donated, we will bump you up on the queue.'+
                    '  Thank you so much for supporting us! You should receive the confirmation email within a few minutes.'+
                   '</p>'
                  ) :
                  ''
              ) +
              '<p style="margin-top: 15px;">By using this website you are agreeing to our <a href="https://help.kassellabs.io/strangerthings/" target="_blank">Terms of Service</a>.</p>',
      }).then(()=>{},()=>{});
    },
    error: ajaxErrorFunction('Error when request video download.'),
  });
};

export default function downloadVideo(openingKey){
    // check if download is available:
  $.ajax({
    url: "https://upsidedown.kassellabs.io/status?code="+openingKey,
    crossDomain: true,
    success: (data) => {
      var queue = data.queue;

      if (data.status === 'not_queued') {
        queue = data.queueSize;
      }

      // video already rendered
      if(data.url){
        swal({
          title: '<h2>Download</h2>',
          html: '<p>'+
                        'This video has already been generated, click the link below to download.<br><br>'+
                        '<a href="'+data.url+'">'+data.url+'</a></p>',
        }).then(()=>{},()=>{});
        return ;
      }

      var generateAlert = {
        title: '<h2>Video Download</h2>',
        html: '<p>'+
                    'Type your email below and you will receive a message with the URL to download your video when it\'s ready'+
                    '</p>',
        input: 'email',
        showCancelButton: true,
        inputPlaceholder: "Your e-mail...",
        showLoaderOnConfirm: true,
      };

      swal({
        title: '<h2>Donate and Download</h2>',
        html: '<p>'+
                        'We want to provide videos for free, but we have to use a server to render it, which costs money.<br>'+
                        'There are <b>'+(queue+1)+' videos</b> in front of you and it will take <b>'+calcTime(queue)+'</b> to be processed.<br/><br/>'+
                        'Can\'t wait for it? Donate at least <b>$'+donationMinimum+' Dollars</b>, you will jump the queue and your video will be ready in few hours.<br><br/>'+
                        'The video will be rendered in Full HD quality and MP4 file. To see a sample video click '+
                        '<a href="https://youtu.be/Q0eEXKyA540" target="_blank">here</a>. <br/>'+
                        'Attention! Make sure there are no typos in your text, there will be no correction after the video rendering.<br><br/>'+
                        'By using this website you are agreeing to our <a href="https://help.kassellabs.io/strangerthings/" target="_blank">Terms of Service</a>.'+
                        '</p>',
        showCancelButton: true,
        confirmButtonText: "Yes, donate!",
        cancelButtonText: "No, I'll get in the queue!",
        animation: "slide-from-top",
      }).then(() => {

        const donateAlert = {
          ...generateAlert,
        };

        donateAlert.title = '<h2>Donate</h2>';
        donateAlert.html =`
          <p>Thanks for your support! Remember, at least $${donationMinimum} Dollars for the rendered video.</p>
          <p>You can pay via Credit Card or via PayPal.</p>
          <iframe
            id="stripeDonateIframe"
            title="Stripe Payment Form"
            src="${paymentPageUrl}?embed=true&app=stranger-things&code=${openingKey}&amount=${donationMinimum*100}"
            allowpaymentrequest="true"
          ></iframe>
          <p>Or PayPal:</p>
          <iframe src="./donateButtons.html#!/${openingKey}" height="55"></iframe>
          <p>Confirm your email below and you will receive a message with the link to download your video when it's ready</p>
          <p>
            You'll be able to add as many e-mails as you want to
            <b>this video</b>. Just add
            your other emails after the first one, without donating.
            Attention! Make sure there are no typos in your text, you will need to request a new video download and donate again.
            By using this website you are agreeing to our <a href="https://help.kassellabs.io/strangerthings/" target="_blank">Terms of Service</a>.
          </p>
        `;
        swal(donateAlert).then(requestVideo.bind(window, true, openingKey), () => {});
      },() => {
        swal(generateAlert).then(requestVideo.bind(window, false, openingKey), () => {});
      });
    },
    error: ajaxErrorFunction('Error when request video information to download.'),
  });
}
