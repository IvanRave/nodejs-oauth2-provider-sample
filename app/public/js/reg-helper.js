var regHelper = {};

regHelper.sendEmailToken = function () {
	var needEmail = document.getElementById('email').value;

	if (!needEmail) {
		alert('Please fill the email field');
		return;
	}

	var reqUrl = 'email-confirmation';
	var reqType = 'POST';

	var reqBody = JSON.stringify({
			email : needEmail
		});

	var xhReq = new XMLHttpRequest();

  console.log(xhReq);
	xhReq.open(reqType, reqUrl, false);
  
  //xhReq.body = reqBody;
  
  xhReq.onreadystatechange = function(){
    if (xhReq.readyState === 4){
      alert(xhReq.status);
    }
  };
  
  xhReq.setRequestHeader('Content-type', 'application/json');

	xhReq.send(reqBody);
  
  

	// var serverResponse = xhReq.responseText;

	// alert(serverResponse);
};
