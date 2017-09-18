# YAVLJS
`yavl` (pronounced */yavl/*) is **Y**et **A**nother **V**alidation **L**ibrary.
`js` simply because it is a javascript library (and also because `yavl` was taken on npm :/).

# What is exactly yavljs ?

`yavl`, as said earlier, is a validation library. One of the main goals of this library is to be able to use it in the most modular way (being able to tweak the settings easily without touching how it's being managed, separating concerns).

I especially put effort in it to discourage users from hardcoding their form validation settings. I highly recommend the use of [JSON]() configuration files (both for locale and settings) which makes it easier for you to read, have access to and debug (required structure patterns will be shown below).

Another goal of this library is being able to be used by anyone without any kind of dependencies (a decent version of your browser should do the trick). 

# What do I need to use this library ?
To use this library you will need three things:

- The library itself
- A configuration file (describes the form[s] structure[s])
- A locale file (replaces the error messages with yours :D)

## Get the library itself
It is pretty straightforward, you can: 

- Grab the `yavl.js` file and include it
- Use npm (`npm install yavljs`) and most import systems (`const yavl = require("yavljs");`)

## The configuration file
This will give you an idea of the required structure for a form, of course you can use an array of forms (lines marked `//*` are required elements)
```javascript
{
  "form": "#form",//*  -  a selector to the form
  "fields": {
    "field": {
      "selector": "#field",//*
      "error_selector": "#field + p.form-error",//*
      "required": "true",
      "rules": {
        "regex": "^\\w+\\d+$",
        "minLength": "6",
        "maxLength": "64"
      }
    }
  }
}
```

This can then imported in javascript and passed to `yavl`'s constructor.

