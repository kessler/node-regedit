Set stdout = WScript.StdOut
Set stderr = WScript.StdErr
Set args = WScript.Arguments 
Set fs = CreateObject("scripting.filesystemobject") 

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

Sub Include(sPath)
	' TODO this is fragile, but should work for "modules" nested relatively to script root
	include_ScriptPath = Left(WScript.ScriptFullName, InStr(WScript.ScriptFullName, WScript.ScriptName) - 2)	
	sPath = include_ScriptPath & "\" & sPath
	
	include_code = fs.OpenTextFile(sPath).ReadAll 	
	ExecuteGlobal include_code
End Sub 
