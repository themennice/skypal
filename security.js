var aesjs = require('aes-js');

function Hash(string) {
	// Integer hashcode
	var hashcode = 0
	
	for (i = 0; i < string.length; i++){
		hashcode += string.charCodeAt(i) * Math.pow(33, i % 199)
	}
  
	return hashcode % 65521
}

function Encrypt(DataString, Code) {
	// An example 128-bit key (16 bytes * 8 bits/byte = 128 bits)
	var key = Code
	 
	// Convert text to bytes
	var text = DataString
	var textBytes = aesjs.utils.utf8.toBytes(text);
	 
	// The counter is optional, and if omitted will begin at 1
	var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
	var encryptedBytes = aesCtr.encrypt(textBytes);
	 
	// To print or store the binary data, you may convert it to hex
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	
	return encryptedHex
}

function Decrypt(encryptedHex, key) {
	// When ready to decrypt the hex string, convert it back to bytes
	var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
	 
	// The counter mode of operation maintains internal state, so to
	// decrypt a new instance must be instantiated.
	var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
	var decryptedBytes = aesCtr.decrypt(encryptedBytes);
	 
	// Convert our bytes back into text
	var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

	return decryptedText
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

function Sum (array) {
  var x = 0
  for (i = 0; i < array.length; i++) {
    x += array[i]
  }

  return x
}

// String Username, string Password, JSON data
function OnSignup(Username, Password, Data) {
	
	var HashedName = Hash(Username)
	var Code = RandomCode()
		
	pool.query("SELECT * from Users where name=" + HashedName, function(error, result) {
		if (error) {
			console.log(error)
			return { "error" : error }
		}
		
		if (result.rows[0] != null) {
			console.log("User already exists")
			return { "error" : "Exit early: User already exists" }
		}
		
		
		pool.query("INSERT INTO Users VALUES (" + HashedName + ", '{" + Code.toString() + "}')", (error, result) => { if (error) { console.log(error) } } )
	
		var HashedPass = Hash(Password + Sum(Code))
		var DataString = JSON.stringify(Data)
		
		var SafeData = Encrypt(DataString, Code)
		//var UnsafeData = Decrypt(SafeData, Code);
		
		pool.query("INSERT INTO Passwords VALUES (" + HashedPass + ")", (error, result) => { if (error) { console.log(error) } } )
		
		pool.query("INSERT INTO Data Values ('" + SafeData + "', " + Hash(Username + Sum(Code)) + ")", (error, result) => { if (error) { console.log(error) } } )
	})	
}

function OnLogin(Username, Password) {
	
	var HashedName = Hash(Username)
	var Code = null
	
	pool.query("SELECT code FROM Users WHERE name=" + HashedName, function(error, result) {
		if (error) {
			console.log(error)
			return { "error" : error }
		}
		
		if (result.rows[0] == null) {
			console.log("Error logging in, username or passoword was incorrect")
			return { "error" : "Exit early: User does not exist" }
		} else {
			Code = result.rows[0].code
			var HashedPass = Hash(Password + Sum(Code))
			
			pool.query("SELECT * FROM Passwords WHERE pass=" + HashedPass, function(error, result) {
				if (result.rows[0] == null) {
					console.log("Login failed")
				} else {
					console.log("Login successful")
					
					pool.query("SELECT data FROM data WHERE token=" + Hash(Username + Sum(Code)), function(error, result) {
						if (result.rows[0] != null) {
							console.log(JSON.parse(Decrypt(result.rows[0].data, Code)));
						}
					})
				}
			})
		}
	})
}