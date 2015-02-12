# regedit
Read, Write, List and do all sorts of funky stuff to the windows registry using node.js and windows script host.

No pesky native code :-)

## Install
```
    npm install --save regedit
```

## example
```javascript
var regedit = require('regedit')

regedit.list('HKCU\\SOFTWARE', function(err, result) {
    ...
})
```

## API
Every command executes a sub process that runs vbscript code. To boost efficiency, every command supports batching.

### regedit.list([String|Array], [Function])
Lists the direct content of one or more sub keys. Specify an array instead of a string to query multiple keys in the same run.

Given the command:
```javascript
regedit.list(['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE', function(err, result) {
    ...
})
```

The result will look something like the following:
```javascript
{
    'HKCU\\SOFTWARE': {
        keys: [ 'Google', 'Microsoft', ... more direct sub keys ]
        values: {
            'valueName': {
                value: '123',
                type: 'REG_SZ'
            }
            ... more direct child values of HKCU\\SOFTWARE
        }
    },
    'HKLM\\SOFTWARE': {
        keys: [ 'Google', 'Microsoft', ... more direct sub keys ]
        values: {
            'valueName': {
                value: '123',
                type: 'REG_SZ'
            }
            ... more direct child values of HKCU\\SOFTWARE
        }
    }
}
```

### regedit.createKey([String|Array], [Function])
Creates one or more keys in the registry

### regedit.deleteKey([String|Array], [Function])
Deletes one or more keys in the registry

### regedit.putValue(Object, Function)
Put one or more values in the registry. The Object given to this function is almost identical to the result of regedit.list(). 

Here is an example:
```javascript
var valuesToPut = {
    'HKCU\\Software\\MySoftware': {
        'myValue1': {
            value: [1,2,3],
            type: 'REG_BINARY'
        },
        'myValue2': {
            value: 'aString',
            type: 'REG_SZ'
        }
    },
    'HKCU\\Software\\MySoftware\\foo': {
        'myValue3': {
            value: ['a', 'b', 'c']
            type: 'REG_MULTI_SZ'
        }
    }
}

regedit.putValue(valuesToPut, function(err) {

})
```
Supported value types are: 
- REG_SZ, REG_EXPAND_SZ: a string basically
- REG_DWORD, REG_QWORD: should use javascript numbers
- REG_MULTI_SZ: an array of strings
- REG_BINARY: an array of numbers (representing bytes)

## Friendly warning regarding 32bit and 64bit
When launching a 32bit application in 64bit environment, some of your paths will be relative to wow6432node. Things might get a little unexpected if you expected to find something in HKLM\Software in regedit.exe while in fact it is located at HKLM\Software\wow6432node.

Further reading (here)[https://msdn.microsoft.com/en-us/library/windows/desktop/ms724072%28v=vs.85%29.aspx]

## Develop

### Run tests
```
    mocha -R spec
```

### Enable debug output
```
    set DEBUG=regedit
```

## TODO
deleteValue()