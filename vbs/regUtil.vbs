' TODO: consider incorporating a json writer of some sort instead of adhoc solution like the following
' e.g: http://demon.tw/my-work/vbs-json.html

const HKEY_CLASSES_ROOT = &H80000000
const HKEY_CURRENT_USER = &H80000001
const HKEY_LOCAL_MACHINE = &H80000002
const HKEY_USERS = &H80000003
const HKEY_CURRENT_CONFIG = &H80000005

Sub LoadRegistryImplementationByOSArchitecture()
	If IsNull(OSArchitecture) Then
		WriteLineErr "missing OSArchitecture global. did not call util.DetermineOSArchitecture? or Forgot to load util.vbs?"
		WScript.Quit 25125		
	End If

	If OSArchitecture = "A" Then
		Include "ArchitectureAgnosticRegistry.vbs"
	Else
		Include "ArchitectureSpecificRegistry.vbs"
	End If
End Sub 

Function PutValue(constHive, strSubKey, strValueName, strValue, strType)
	Select Case UCase(strType)
		
		Case "REG_SZ"
			PutValue = SetStringValue(constHive, strSubKey, strValueName, strValue)

		Case "REG_EXPAND_SZ"
			PutValue = SetExpandedStringValue(constHive, strSubKey, strValueName, strValue)

		Case "REG_BINARY"
			PutValue = SetBinaryValue(constHive, strSubKey, strValueName, ToBinaryValue(strValue))

		' TODO: need to check that indeed int is the right type here
		Case "REG_DWORD"
			PutValue = SetDWORDValue(constHive, strSubKey, strValueName, CInt(strValue))

		Case "REG_MULTI_SZ"
			PutValue = SetMultiStringValue(constHive, strSubKey, strValueName, Split(strValue, ","))

		Case "REG_QWORD"
			PutValue = SetQWORDValue(constHive, strSubKey, strValueName, CInt(strValue))

		Case Else
			PutValue = SetStringValue(constHive, strSubKey, strValueName, strValue)

	End Select
End Function

' render the child of a sub path strSubKey in hive constHive
' as json.
Sub ListChildrenAsJson(constHive, strSubKey)

	EnumKey constHive, strSubKey, arrKeyNames
	EnumValues constHive, strSubKey, arrValueNames, arrValueTypes

	' start outputting json to stdout
	Write "{"

	If Not IsNull(arrKeyNames) Then
		Write """keys"": ["
		For x = 0 To UBound(arrKeyNames)
			If (x > 0) Then
				Write ","
			End If

			Write """" & JsonSafe(arrKeyNames(x)) & """"
		Next		
		Write "]"
	End If

	If Not IsNull(arrValueNames) Then

		If Not IsNull(arrKeyNames) Then
			Write ","
		End If

		Write """values"":{"
		For y = 0 To UBound(arrValueNames)
			If y > 0 Then
				Write ","
			End If

			strValueName = arrValueNames(y)
			intValueType = arrValueTypes(y)

			Write """"  
			Write JsonSafe(strValueName)
			Write """:{"
			Write """type"": """
			Write RenderType(intValueType)
			Write ""","
			Write """value"":"
			Write RenderValueByType(constHive, strSubKey, strValueName, intValueType)
			Write "}"
		Next
		Write "}"
	End If

	Write "}"	
End Sub

' give a raw HKLM\something\somewhere
' output the hive constant and the subkey, in this case:
' HKEY_LOCAL_MACHINE will be assigned to outConstHive
' and something\somewhere will be assigned to outStrSubKey
Sub ParseHiveAndSubKey(strRawKey, outConstHive, outStrSubKey)	
	' split into two parts to deduce the hive and the sub key
	arrSplitted = Split(strRawKey, "\", 2, 1)
	
	If UBound(arrSplitted) > 0 Then
		strHive = arrSplitted(0)	
		outStrSubKey = arrSplitted(1)
	Else
		strHive = strRawKey
		outStrSubKey = ""
	End If

	outConstHive = StringToHiveConst(UCase(strHive))
End Sub

Function StringToHiveConst(strHive)
	
	Select Case strHive
		Case "HKCR"
			StringToHiveConst = HKEY_CLASSES_ROOT
		Case "HKCU"
			StringToHiveConst = HKEY_CURRENT_USER
		Case "HKLM"
			StringToHiveConst = HKEY_LOCAL_MACHINE
		Case "HKU"
			StringToHiveConst = HKEY_USERS
		Case "HKCC"
			StringToHiveConst = HKEY_CURRENT_CONFIG
		Case Else
			StringToHiveConst = Null	
	End Select	

End Function

' convert a value type number into a string label
Function RenderType(intType)
	RenderType = "REG_UNKNOWN"

	Select Case intType
		Case 1
			RenderType = "REG_SZ"
		Case 2
			RenderType = "REG_EXPAND_SZ"
		Case 3
			RenderType = "REG_BINARY"
		Case 4
			RenderType = "REG_DWORD"
		Case 7
			RenderType = "REG_MULTI_SZ"
		Case 11	
			RenderType = "REG_QWORD"
	End Select

End Function

' get the value of a registry based on its value type and return it as json
' string will return as a string with doubel quotes, e.g "value"
' multi string values which return as an array ot strings "["1", "2"]" (double quotes included ofc)
' numeric values like DWORD and QWORD just return as the number e.g. 1
' byte arrays such as reg_binary return as an array of ints, e.g [1,2,3]
Function RenderValueByType(constHive, strKey, strValueName, intType)

	Select Case intType
		Case 1
			GetStringValue constHive, strKey, strValueName, strValue
			RenderValueByType = """" & JsonSafe(strValue) & """"
		Case 2
			GetExpandedStringValue constHive, strKey, strValueName, strValue
			RenderValueByType = """" & JsonSafe(strValue) & """"
		Case 3
			GetBinaryValue constHive, strKey, strValueName, arrBinaryValue			
			RenderValueByType = RenderByteArray(arrBinaryValue)
		Case 4
			GetDWORDValue constHive, strKey, strValueName, intDWordValue
			RenderValueByType= intDWordValue
		Case 7
			GetMultiStringValue constHive, strKey, strValueName, arrStrValue			
			RenderValueByType = RenderStringArray(arrStrValue)
		Case 11	
			GetQWORDValue constHive, strKey, strValueName, intQWordValue
			RenderValueByType = intQWordValue
	End Select

End Function

' render a byte array as a json array of numbers
Function RenderByteArray(arr)
	RenderByteArray = "[]"

	If Not IsNull(arr) Then		
		RenderByteArray = "[" & Join(arr, ",") & "]"
	End If
End Function

' render a string array as json string array
Function RenderStringArray(arr)	
	Result = "["
	If Not IsNull(arr) Then
		For t = 0 To UBound(arr)
			If (t > 0) Then
				Result = Result &  ","
			End If

			Result = Result & """" & JsonSafe(arr(t)) & """"
		Next
	End If
	Result = Result & "]"

	RenderStringArray = Result
End Function

Function ToBinaryValue(strValue)

	arrValue = Split(strValue, ",")
	
	If IsNull(arrValue) Then		
		ToBinaryValue = Array()
		Exit Function
	End If

	For i = 0 To UBound(arrValue)
		arrValue(i) = CInt(arrValue(i))
	Next

	ToBinaryValue = arrValue
End Function