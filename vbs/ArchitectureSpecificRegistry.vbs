' Notes: wanted to implement this using a class but:
' 1. No matter what I did I could not assign the result of GetObject to a private member
' 2. It looks as if all methods were treated as subs from the outside world which is not good since 
' some of these need to return a value

' should be removed when migration is complete
Set private_oReg = GetObject("winmgmts:\root\default:StdRegProv")		

Set private_oCtx = CreateObject("WbemScripting.SWbemNamedValueSet")
private_oCtx.Add "__ProviderArchitecture", CInt(Architecture)

Set private_oLocator = CreateObject("Wbemscripting.SWbemLocator")
Set private_oServices = private_oLocator.ConnectServer(".", "root\default","","",,,,private_oCtx)
Set private_oRegSpecific = private_oServices.Get("StdRegProv") 

Function SetStringValue(constHive, strSubKey, strValueName, strValue)	
	SetStringValue  = private_oReg.SetStringValue(constHive, strSubKey, strValueName, strValue)	
End Function

Sub GetStringValue(constHive, strKey, strValueName, strValue)
	private_oReg.GetStringValue constHive, strKey, strValueName, strValue
End Sub

Function SetExpandedStringValue(constHive, strSubKey, strValueName, strValue)
	SetExpandedStringValue = private_oReg.SetExpandedStringValue(constHive, strSubKey, strValueName, strValue)
End Function

Sub GetExpandedStringValue(constHive, strKey, strValueName, strValue)
	private_oReg.GetExpandedStringValue constHive, strKey, strValueName, strValue
End Sub

Function SetMultiStringValue(constHive, strSubKey, strValueName, arrValue)
	SetMultiStringValue = private_oReg.SetMultiStringValue(constHive, strSubKey, strValueName, arrValue)
End Function

Sub GetMultiStringValue(constHive, strKey, strValueName, arrStrValue)
	private_oReg.GetMultiStringValue constHive, strKey, strValueName, arrStrValue
End Sub 

Function SetDWORDValue(constHive, strSubKey, strValueName, arrValue)
	SetDWORDValue = private_oReg.SetDWORDValue(constHive, strSubKey, strValueName, arrValue)
End Function

Sub GetDWORDValue(constHive, strKey, strValueName, intDWordValue)
	private_oReg.GetDWORDValue constHive, strKey, strValueName, intDWordValue
End Sub

Function SetQWORDValue(constHive, strSubKey, strValueName, arrValue)
	SetQWORDValue = private_oReg.SetQWORDValue(constHive, strSubKey, strValueName, arrValue)
End Function

Sub GetQWORDValue(constHive, strKey, strValueName, intQWordValue)
	private_oReg.GetQWORDValue constHive, strKey, strValueName, intQWordValue
End Sub

Function SetBinaryValue(constHive, strSubKey, strValueName, arrValue)
	SetBinaryValue = private_oReg.SetBinaryValue(constHive, strSubKey, strValueName, arrValue)
End Function

Sub GetBinaryValue(constHive, strKey, strValueName, arrBinaryValue)
	private_oReg.GetBinaryValue constHive, strKey, strValueName, arrBinaryValue
End Sub

Sub EnumKey(constHive, strSubKey, arrKeyNames)	
	Set Inparams = private_oRegSpecific.Methods_("EnumKey").Inparameters
	Inparams.Hdefkey = constHive
	Inparams.Ssubkeyname = strSubKey

	set Outparams = private_oRegSpecific.ExecMethod_("EnumKey", Inparams,,private_oCtx)
	
	arrKeyNames = Outparams.Snames
End Sub

Sub EnumValues(constHive, strSubKey, arrValueNames, arrValueTypes)
	Set Inparams = private_oRegSpecific.Methods_("EnumValues").Inparameters
	Inparams.Hdefkey = constHive
	Inparams.Ssubkeyname = strSubKey

	set Outparams = private_oRegSpecific.ExecMethod_("EnumValues", Inparams,,private_oCtx)
	
	arrValueNames = Outparams.Snames
	arrValueTypes = Outparams.Types
End Sub

Function CreateKey(constHive, strSubKey)
	CreateKey = private_oReg.CreateKey(constHive, strSubKey)
End Function

Function DeleteKey(constHive, strSubKey)
	DeleteKey = private_oReg.DeleteKey(constHive, strSubKey)
End Function
