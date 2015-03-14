Function JsonSafe(outStrText)	
	outStrText = Replace(outStrText, "\", "\\")
	outStrText = Replace(outStrText, """", "\""")
	outStrText = JsonU(outStrText)
	'JsonSafe = Escape(outStrText)
	JsonSafe = outStrText
End Function