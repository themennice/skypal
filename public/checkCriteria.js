function validateForm(){
	var password = document.forms["registerForm"]["password"].value;
    var confirmPassword = document.forms["registerForm"]["confirmPassword"].value;
    var Uemail = document.forms["registerForm"]["email"].value;
    //console.log(password);
    //console.log(confirmPassword);
    if (password == confirmPassword)
        return true;
    else
    {
    	alert("password does not match!");
        return false;
    } 
}
