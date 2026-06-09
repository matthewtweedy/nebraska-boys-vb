(function () {
  var formId = 'f589bbf0-63be-11f1-8981-7717916653ae';
  var delayMs = 3000;

  function loadNewsletterForm() {
    if (document.querySelector('script[data-form="' + formId + '"]')) {
      return;
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://eomail5.com/form/' + formId + '.js';
    script.setAttribute('data-form', formId);
    document.body.appendChild(script);
  }

  window.setTimeout(loadNewsletterForm, delayMs);
}());
