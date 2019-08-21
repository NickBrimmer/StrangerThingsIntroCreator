import swal from 'sweetalert2';
import * as Sentry from '@sentry/browser';

export default function ajaxErrorFunction(bodyMessage){
  return function (error){
    console.log(error.status, error.statusText);
    Sentry.addBreadcrumb({
      message: 'Error modal with body message: '+ bodyMessage,
      level: 'info',
    });
    Sentry.captureException(error);

    swal({
      title: '<h2 style="font-family: BenguiatITCW01-BoldCn;">An Error has occured</h2>',
      html: '<p style="text-align: left">Something went wrong! Sorry about that! Please try again reloading the page, if this error repeats please report to us on the button below.'+
            '</p>',
      type: "error",
      confirmButtonText: "Reload Page",
      cancelButtonText: "Report details",
      showCancelButton: true,
    }).then(() => {
      window.location.reload();
    },() => {
      Sentry.lastEventId();
      Sentry.showReportDialog();
    });
  };
}