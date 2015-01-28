Set stdout = WScript.StdOut
Set args = WScript.Arguments 

Sub Write(message)
	stdout.Write message
End Sub

Sub WriteLine(message)
	stdout.WriteLine message
End Sub

