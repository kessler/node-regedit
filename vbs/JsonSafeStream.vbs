Function JsonSafe(outStrText)
	' different from normal JsonSafe, here we also escape the newline
	' since it is used as separator when writing results to stdout
	outStrText = Replace(outStrText, vbcrlf, "\\r\\n")

	outStrText = Replace(outStrText, "\", "\\")
	outStrText = Replace(outStrText, """", "\""")	
	JsonSafe = JsonU(outStrText)
End Function