Function JsonSafe(outStrText)	
	outStrText = Replace(outStrText, "\", "\\")
	outStrText = Replace(outStrText, """", "\""")	
	JsonSafe = JsonU(outStrText)
End Function