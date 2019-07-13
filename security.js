var aesjs = require('aes-js');


// Function to map a reasonably sized string to a value between 0 and 65521
function Hash(string) {
	// Integer hashcode
	var hashcode = 0
	
	// Run a polynomial hashing function
	for (i = 0; i < string.length; i++){
		hashcode += string.charCodeAt(i) * Math.pow(33, i % 199)
	}
  
	// Compress the hashcode
	return hashcode % 65521
}

function Encrypt(DataString, Code) {
	// 128-bit key (16 bytes * 8 bits/byte = 128 bits)
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

// Function will return the sum of an integer array
function Sum (array) {
  var x = 0
  for (i = 0; i < array.length; i++) {
    x += array[i]
  }

  return x
}

// String Username, string Password, JSON data
function OnSignup(Username, Password, Data) {
	
	// Hash the given username and create a random array of integers
	var HashedName = Hash(Username)
	var Code = RandomCode()
	
	// Check if the hashed name already exists in the database
	pool.query("SELECT * from Users where name=" + HashedName, function(error, result) {
		if (error) {
			console.log(error)
			return { "error" : error }
		}
		
		if (result.rows[0] != null) {
			console.log("User already exists")
			return { "error" : "Exit early: User already exists" }
		}
		
		// If the user is a new user, add them to the database
		pool.query("INSERT INTO Users VALUES (" + HashedName + ", '{" + Code.toString() + "}')", (error, result) => { if (error) { console.log(error) } } )
	
		// Hash their password and encrypt their data
		var HashedPass = Hash(Password + Sum(Code))
		var DataString = JSON.stringify(Data)
		var SafeData = Encrypt(DataString, Code)

		// Insert the hashed password into the database
		pool.query("INSERT INTO Passwords VALUES (" + HashedPass + ")", (error, result) => { if (error) { console.log(error) } } )
		
		// Insert the data into the data database :P
		pool.query("INSERT INTO Data Values ('" + SafeData + "', " + Hash(Username + Sum(Code)) + ")", (error, result) => { if (error) { console.log(error) } } )
	})	
}

// String Username, string Password
function OnLogin(Username, Password) {
	
	// Hash the given username
	var HashedName = Hash(Username)
	var Code = null
	
	// Check if the hashed name is in the database
	pool.query("SELECT code FROM Users WHERE name=" + HashedName, function(error, result) {
		if (error) {
			console.log(error)
			return { "error" : error }
		}
		
		if (result.rows[0] == null) {
			console.log("Error logging in, username or passoword was incorrect")
			return { "error" : "Exit early: User does not exist" }
		} else {
			
			// If the user is in the database, retrieve their user code and hash the given password
			Code = result.rows[0].code
			var HashedPass = Hash(Password + Sum(Code))
			
			// Check if the passwords match
			pool.query("SELECT * FROM Passwords WHERE pass=" + HashedPass, function(error, result) {
				if (result.rows[0] == null) {
					console.log("Login failed")
				} else {
					console.log("Login successful")
					
					// If the passwords match, return their user data
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