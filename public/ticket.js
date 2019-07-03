var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0
var yyyy = today.getFullYear();
 if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 

today = yyyy+'-'+mm+'-'+dd;

document.getElementById("date").setAttribute("min", today);
document.getElementById("date").setAttribute("value", today);

function submitForm()
{
	var countryfrom = document.getElementById("countryfrom");
	var countryto = document.getElementById("countryto");
	if (countryto == countryfrom)
	{
		alert("Invalid Input Of Destinated Country!")
		return;
	}
	var button = getElementById("submit");
	button.onclick(alert("form submitted! Thank you."))
}