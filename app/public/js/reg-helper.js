var regHelper = {};

regHelper.sendEmailToken = function () {
	var needEmail = document.getElementById('email').value;

	if (!needEmail) {
		alert('Please fill the email field');
		return;
	}
  
  var ccBtn = document.getElementById('send-cc-btn');
	ccBtn.disabled = true;

	var reqUrl = 'email-confirmation';
	var reqType = 'POST';

	var reqBody = JSON.stringify({
			email : needEmail
		});

	var xhReq = new XMLHttpRequest();

	console.log(xhReq);
	xhReq.open(reqType, reqUrl, false);

	//xhReq.body = reqBody;

	xhReq.onreadystatechange = function () {
    ccBtn.disabled = false;
		if (xhReq.readyState === 4) {
			if (xhReq.status === 200) {
				alert('A confirmation code was sent. Please check your email.');
			} else {
				alert('An error occurred during sending. Please contact to administration or try again later.');
			}
		}
	};

	xhReq.setRequestHeader('Content-type', 'application/json');

	xhReq.send(reqBody);

	// var serverResponse = xhReq.responseText;

	// alert(serverResponse);
};
