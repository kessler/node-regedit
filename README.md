# regedit
Read, Write, List and do all sorts of funky stuff to the windows registry using node.js and windows script host.

No pesky native code :-)

## Install
[![NPM](https://nodei.co/npm/regedit.png)](https://nodei.co/npm/regedit/)
[![NPM](https://nodei.co/npm-dl/regedit.png)](https://nodei.co/npm/regedit/)

## Example
```javascript
var regedit = require('regedit')

regedit.list('HKCU\\SOFTWARE', function(err, result) {
    ...
})

regedit.putValue({
    'HKCU\\SOFTWARE\\MyApp': {
        'Company': {
            value: 'Moo corp',
            type: 'REG_SZ'
        },
        'Version': { ... }
    },
    'HKLM\\SOFTWARE\\MyApp2': { ... }
}, function(err) {
    ...
})

regedit.createKey(['HKLM\\SOFTWARE\\Moo', 'HKCU\\SOFTWARE\\Foo'], function(err) {
    ...
})
```
#### Friendly warning regarding 32bit and 64bit OS / Process
When launching a 32bit application in 64bit environment, some of your paths will be relative to wow6432node. Things might get a little unexpected if you try to find something you thought was in HKLM\Software when in fact it is located at HKLM\Software\wow6432node. To overcome this the [arch](#regeditarchlist32stringarray-function) methods were added.

Further reading [here](https://msdn.microsoft.com/en-us/library/windows/desktop/ms724072%28v=vs.85%29.aspx)

#### A note about Electron
This software uses Windows Script Host to read and write to the registry. For that purpose, it will execute [`.wsf`](https://github.com/ironSource/node-regedit/tree/master/vbs) files. When packaging the app's dependencies with ASAR, `node-regedit` will not be able to access the windows script files, because they are bundled in a single ASAR file. Therefore it is necessary to store the `.wsf` files elsewhere, outside of the packaged asar file. You can set your custom location for the files with `setExternalVBSLocation(location)`:

```
// Assuming the files lie in <app>/resources/my-location
const vbsDirectory = path.join(path.dirname(electron.remote.app.getPath('exe')), './resources/my-location');
regedit.setExternalVBSLocation(vbsDirectory);
```

# API
Every command executes a sub process that runs vbscript code. To boost efficiency, every command supports batching.

## Reading keys and values

### regedit.list([String|Array], [Function])
Lists the direct content of one or more sub keys. Specify an array instead of a string to query multiple keys in the same run.

Given the command:
```javascript
regedit.list(['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE'], function(err, result) {
    ...
})
```

*Result* will be an object with the following structure:
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
            ... more direct child values of HKLM\\SOFTWARE
        }
    }
}
```

##### Note about listing default values
In the windows registry a key may have a default value. When enumarting value names, the default value's name will be empty.
This presents a minor problem when including the empty value in a set with other values since it cannot be safely named with anything but the empty string, for fear of collision with other values. 

Thus, accessing the default value becomes slightly awkward:
```javascript
regedit.list('path\\to\\default\\value', function (err, result) {
    var defaultValue = result['path\\to\\default\\value'].values[''].value
})
```
For now this is how its going to be, but in the future this will probably change, possibly in a way that will effect the whole interface.

***list with callback api will be deperecated and eventually removed in future versions, take a look at the streaming interface below***

### regedit.list([String|Array]) - streaming interface
Same as **regedit.list([String|Array], [Function])** exposes a streaming interface instead of a callback. This is useful for situations where you have a lot of data coming in and out of the list process. Eventually this will completely replace the list() with callback api

**This operation will mutate the keys array**

Example:
```javascript
regedit.list(['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE'])
.on('data', function(entry) {
    console.log(entry.key)
    console.log(entry.data)
})
.on('finish', function () {
    console.log('list operation finished')
})
```
This code output will look like this:
```
HKCU\\SOFTWARE
{
    keys: [ 'Google', 'Microsoft', ... more direct sub keys ]
    values: {
        'valueName': {
            value: '123',
            type: 'REG_SZ'
        }
        ... more direct child values of HKCU\\SOFTWARE
    }
}
HKLM\\SOFTWARE
{
    keys: [ 'Google', 'Microsoft', ... more direct sub keys ]
    values: {
        'valueName': {
            value: '123',
            type: 'REG_SZ'
        }
        ... more direct child values of HKLM\\SOFTWARE    
    }
}
```

#### regedit.arch.list32([String|Array], [Function])
same as *regedit.list([String|Array], [Function])*, only force a 32bit architecture on the registry

#### regedit.arch.list32([String|Array])
streaming interface, see *regedit.list([String|Array])*

#### regedit.arch.list64([String|Array], [Function])
same as list, only force a 64bit architecture on the registry

#### regedit.arch.list64([String|Array])
streaming interface, see *regedit.list([String|Array])*

#### regedit.arch.list([String|Array], [Function])
same as list, only force your system architecture on the registry (select automatically between list64 and list32)

#### regedit.arch.list([String|Array])
streaming interface, see *regedit.list([String|Array])*

## Manipulating the registry
### regedit.createKey([String|Array], [Function])
Creates one or more keys in the registry
**This operation will mutate the keys array**

### regedit.deleteKey([String|Array], [Function])
Deletes one or more keys in the registry
**This operation will mutate the keys array**

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
- REG_DEFAULT: see note about default values below

##### Note about setting default values
When including a default value in a putValue operation, one must use the REG_DEFAULT type. Further more, the name of the value is insignificant since in the registry the default value has no name, but because of the way the node and the vb processes communicate a name must be used. Please note that the only legal value type of a default value is REG_SZ

this is a temporary solution and is subject to change in future versions
```javascript
var values = {
    'HKCU\\Software\\MySoftware': {
        'someNameIDontCareAbout': {
            value: 'Must be a string',
            type: 'REG_DEFAULT'
        },
        'myValue2': {
            value: 'aString',
            type: 'REG_SZ'
        }
    }
}
regedit.putValue(values, function (err) {    
})
```
For now this is how its going to be, but in the future this will probably change, possibly in a way that will effect the whole interface.

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
