var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0
var yyyy = today.getFullYear();
 if(dd<10){
        dd='0'+dd
<<<<<<< HEAD
    } 
    if(mm<10){
        mm='0'+mm
    } 
=======
    }
    if(mm<10){
        mm='0'+mm
    }
>>>>>>> 35518480b228856b0edee55e337afd0e3863f113

today = yyyy+'-'+mm+'-'+dd;

document.getElementById("date").setAttribute("min", today);
document.getElementById("date").setAttribute("value", today);

<<<<<<< HEAD
function submitForm()
{
	var countryfrom = document.getElementById("countryfrom");
	var countryto = document.getElementById("countryto");
=======
function submitForm(event)
{
	var countryfrom = document.getElementById("countryfrom").value;
	var countryto = document.getElementById("countryto").value;
>>>>>>> 35518480b228856b0edee55e337afd0e3863f113
	if (countryto == countryfrom)
	{
		alert("Invalid Input Of Destinated Country!")
		return;
	}
<<<<<<< HEAD
	var button = getElementById("submit");
	button.onclick(alert("form submitted! Thank you."))
}
=======
	else
		alert("Form submitted! Thank you.")
}
>>>>>>> 35518480b228856b0edee55e337afd0e3863f113
