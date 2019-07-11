function validateForm(){
	var password = document.forms["registerForm"]["password"].value;
    var confirmPassword = document.forms["registerForm"]["confirmPassword"].value;
    var email = document.forms["registerForm"]["email"].value;
    //console.log(password);
    //console.log(confirmPassword);
    if (password == confirmPassword)
    {
        sendEmail(email);
        return true;
    }
    else
    {
    	alert("password does not match!");
        return false;
    } 
}

function sendEmail(email)
{
    var link = "mailto:'"+email+"'"+ "&subject=" + escape("Test")+ "&body=" + escape("Testing");
    window.location.href = link;
}