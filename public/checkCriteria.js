function validateForm(){
	var password = document.forms["registerForm"]["password"].value;
    var confirmPassword = document.forms["registerForm"]["confirmPassword"].value;
    var Uemail = document.forms["registerForm"]["email"].value;
    var mandrill = require('node-mandrill')('84ac4065a5019c7e1a8ab2a2096c3bf1-us3');
    //console.log(password);
    //console.log(confirmPassword);
    if (password == confirmPassword)
    {
        mandrill('/messages/send', {
        message: {
            to: Uemail,
            from_email: 'chc70@sfu.ca',
            subject: "Test",
            text: "Testing"
            }
        }, function(error, response)
        {
            //uh oh, there was an error
            if (error) console.log( JSON.stringify(error) );

            //everything's good, lets see what mandrill said
            else console.log(response);
        });
        return true;
    }
    else
    {
    	alert("password does not match!");
        return false;
    } 
}

/*function sendEmail(email)
{
    var link = "mailto:'"++"'"+ "&subject=" + escape("Test")+ "&body=" + escape("Testing");
    window.location.href = link;
}*/
