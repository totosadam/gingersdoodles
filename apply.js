/* Puppy application — builds the email body and opens the family's mail app. */
(function () {
  var form = document.getElementById('app-form');
  if (!form) return;

  var label = {
    first_name: "First name", last_name: "Last name", email: "Email", phone: "Phone",
    street: "Street", street2: "Street line 2", city: "City", state: "State", zip: "Zip",
    housing: "Own or rent", household: "Adults & children at home", pets: "Other pets",
    alone: "Hours alone per day", yard: "Fenced yard", experience: "Puppy experience",
    breed: "Breed", litter: "Litter of interest", sex: "Sex preference",
    size: "Size preference", color: "Color preference", timing: "Timing",
    about: "About the family", signature: "Signature", date: "Date"
  };
  var agreements = {
    agree_companion: "Family companion / spay-neuter, no breeding rights",
    agree_vet: "Vet exam within 72 hours",
    agree_return: "Will contact Ginger's Doodles first if unable to keep",
    agree_care: "Will keep vaccinations, grooming, and vet care current",
    agree_deposit: "Understands the reservation fee is non-refundable"
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    function get(n) {
      var el = form.elements[n];
      return el ? (el.value || '').trim() : '';
    }
    var address = [get('street'), get('street2'),
      [get('city'), get('state')].filter(Boolean).join(', '), get('zip')].filter(Boolean);

    var lines = [];
    lines.push("PUPPY APPLICATION — GINGER'S DOODLES", '');
    lines.push('APPLICANT');
    lines.push('Name: ' + [get('first_name'), get('last_name')].filter(Boolean).join(' '));
    lines.push('Email: ' + get('email'));
    lines.push('Phone: ' + get('phone'));
    if (address.length) lines.push('Address: ' + address.join(' / '));
    lines.push('', 'HOME');
    ['housing', 'household', 'pets', 'alone', 'yard', 'experience'].forEach(function (k) {
      lines.push(label[k] + ': ' + get(k));
    });
    lines.push('', 'PUPPY PREFERENCES');
    ['breed', 'litter', 'sex', 'size', 'color', 'timing'].forEach(function (k) {
      lines.push(label[k] + ': ' + get(k));
    });
    lines.push('', 'ABOUT THE FAMILY', get('about') || '—');
    lines.push('', 'AGREEMENTS');
    Object.keys(agreements).forEach(function (k) {
      var el = form.elements[k];
      lines.push((el && el.checked ? '[x] ' : '[ ] ') + agreements[k]);
    });
    lines.push('', 'SIGNATURE');
    lines.push('Signed: ' + get('signature'));
    lines.push('Date: ' + get('date'));

    var who = [get('first_name'), get('last_name')].filter(Boolean).join(' ');
    var subject = 'Puppy application' + (who ? ' — ' + who : '');
    var href = 'mailto:gingersdoodles@yahoo.com?subject=' + encodeURIComponent(subject) +
               '&body=' + encodeURIComponent(lines.join('\n'));

    var fallback = document.getElementById('mail-fallback');
    if (fallback) fallback.setAttribute('href', href);

    var formScreen = document.getElementById('form-screen');
    var sentScreen = document.getElementById('sent-screen');
    if (formScreen) formScreen.style.display = 'none';
    if (sentScreen) sentScreen.style.display = '';
    window.scrollTo(0, 0);

    window.location.href = href;
  });
})();
