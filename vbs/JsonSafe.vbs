Function JsonSafe(outStrText)	
	outStrText = Replace(outStrText, "\", "\\")
	outStrText = Replace(outStrText, """", "\""")
	outStrText = JsonU(outStrText)
	outStrText = Escape(outStrText)
	JsonSafe = outStrText
End Function