Psuedocode:

Hash(string -> text) {
	int hashcode
	for i in range text.length {
		hashcode += ascii(text[i])*33^i
	}
	return hashcode mod 16127
}

Encrypt(string -> text, string -> key) {
	
}

Decrypt(string -> text, string -> key) {
	
}

OnSignup(string -> Username, string -> Password, obj -> Data) {
	
	HashedName = Hash(Username)
	Code = RandomCode()
	
	if DatabaseQuery(HashedName)
		return SignupError
	
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