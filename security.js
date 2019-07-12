Psuedocode:

function Hash(string) {
	// Integer hashcode
	var hashcode = 0
	
	for (i = 0; i < string.length; i++){
		hashcode += string.charCodeAt(i) * Math.pow(33, i % 199)
	}
  
	return hashcode % 16127
}

Encrypt(string -> text, string -> key) {
	
}

Decrypt(string -> text, string -> key) {
	
}

function RandomCode() {
	// 128 bit code
	var code = []
	for (i = 0; i < 16; i++) {
		var high = 127
		var low = 0
		// number between low and high (inclusive)
		code.push( Math.floor(Math.random() * (high - low + 1) + low) )
	}
	return code
}

// String Username, string Password, JSON data
OnSignup(Username, Password, Data) {
	
	var HashedName = Hash(Username)
	var Code = RandomCode()
	
	if DatabaseQuery(HashedName) {
		return SignupError
	}
	
	DatabaseInsert("Users", HashedName, Code)
	
	HashedPass = Hash(Password + Code)
	
	DatabaseInsert("Passwords", HashedPass)
	
	DataString = Stringify(Data)
	
	SafeData = Encrypt(Data, Code)
	
	DatabaseInsert("Data", SafeData)
}

OnLogin(string -> Username, string -> Password) {
	
	HashedName = Hash(Username)
	
	Code = null
	
	if DatabaseQuery("Users", HashedName)
		Code = DatabasePull("Users", "Code")
	else
		return LoginError
	
	HashedPass = Hash(Password + Code)
	
	if DatabaseQuery(HashedPass)
		return Login
	else
		return LoginError
}