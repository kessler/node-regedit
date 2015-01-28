Set stdout = WScript.StdOut
Set stderr = WScript.StdErr
Set args = WScript.Arguments 

Sub WriteErr(message)
	stderr.Write message
End Sub

Sub WriteLineErr(message)
	stderr.WriteLine message
End Sub

Sub Write(message)
	stdout.Write message
End Sub

Sub WriteLine(message)
	stdout.WriteLine message
End Sub

