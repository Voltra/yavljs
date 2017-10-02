# YAVLJS
`yavl` (pronounced */yavl/*) is **Y**et **A**nother **V**alidation **L**ibrary.
`js` simply because it is a javascript library (and also because `yavl` was taken on npm :/).

# What is exactly yavljs ?

`yavl`, as said earlier, is a validation library. One of the main goals of this library is to be able to use it in the most modular way (being able to tweak the settings easily without touching how it's being managed, separating concerns).

I especially put effort in it to discourage users from hardcoding their form validation settings. I highly recommend the use of [JSON](https://en.wikipedia.org/wiki/JSON) configuration files (both for locale and settings) which makes it easier for you to read, have access to and debug (required structure patterns will be shown below).

Another goal of this library is to be able to be used by anyone without any kind of dependencies (a decent version of your browser should do the trick).
This also means that dependency injection is highly recommended.

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

This can then be imported in javascript and passed to `yavl`'s constructor.
Note that the fields's names can be whatever you want them to be, they are not tied to any kind of code, they are just here to remind you what they are :D !

## The locale file
You might need to adapt the messages to the person that is visiting your site, therefore I decided to go with a configuration approach for the error messages.
Just like you declare the form's constraints, you will replace the messages yourself (if desired):
```javascript
{
    "NaN": "That should be a number, I guess. Sadly, it isn't one.",
    "required": "Hey did you think you could get past me ?",
    "min": "That should be &ge; %value%.",
    "max": "That should be &le; %value%.",
    "nomatch_regex": "Format invalide.",
    "minLength": "At least %value% characters ffs.",
    "maxLength": "%value% characters is way too much !",
    "notEqual": "I can sense a disturbance in the equivalence."
}
```

Note that this is completely optionnal, `yavl` comes with default error messages and you can totally omit one in your locale files if you desire to do so.

(the above is a complete set of all available core features)

# How do I use this ?
Well, let's imagine the following structure (you can also see the [example page](example/index.html)):

```html
<form id="form">
  <input type="text" name="username"/>
  <p class="error"></p>
  <br/>

  <input type="password" name="password"/>
  <p class="error"></p>
  <br/>

  <input type="password" name="c_password"/>
  <p class="error"></p>
  <br/>

  <button type="submit">Log in</button>
</form>
```

I'll use the default locale and the following configuration file:
```js
{
  "form": "#form",
  "fields": {
    "username": {
      "required": "true",
      "selector": "[name='username']",
      "error_selector": "[name='username'] + p.error",
      "rules": {
        "regex": "^\w{6}$",
        "userInDatabase": "true" //supposedly a library's rule
      },
      "password": {
        "required": "true",
        "type": "int", //stupid but exists
        "selector": "[name='password']",
        "error_selector": "[name='password'] + p.error",
        "rules": {
          "regex": "^\d+$",
          "passwordFor": "username" //supposedly a library's rule
        }
      },
      "confirmPassword": {
        "required": "true",
        "type": "int",
        "selector": "[name='c_password']",
        "error_selector": "[name='c_password'] + p.error",
        "rules": {
          "regex": "^\d+$",
          "match": "password"
        }
      }
    }
  }
}
```

And then the associated javascript file (usage of [fetchJSON](https://www.npmjs.com/package/fetch_json)):
```javascript
document.addEventListener("DOMContentLoaded", ()=>{
  fetchJSON("json/formConfig.json", config=>{
    const v = new yavl(
      config.form,
      config.fields
    );

    document.querySelector(config.form)
    .addEventListener("submit", event={
      v.validateForm(event);
    });
    
    document.querySelector(config.form + " *")
    .addEventListener("change", event=>{
      v.validateForm(event);
    })
  });
});
```


# More specific details
## The yavl constructor
An instance of `yavl` is (supposed to handle) one and only one form.
The constructor is detailed this way :
```
new yavl(
  form's selector,
  form's field (as in the config file),
  locale object (as in the config file) [optional defaulted to {}],
  function used to validate a rule [optional defaulted],
  function used to "invalidate" a rule [optional defaulted]
);
```

## Validation and "invalidation"
Validation and "invalidation" functions are defined as the following:
```
validate:: (error's selector) -> void
invalidate:: (event, error's selector, error message) -> void
```

## Extending yavl with custom rules
Extending `yavl` is fairly simple : I added a simple and straightforward plugin system.

Using `yavl.registerRule(name, function)` you can add a new rule to the list of plugin rules.
Using `yavl.removeRule(name, function)` you can remove a rule from the list of plugin rules.
*warning: * Be aware that you might override someone else's rule !

Internally, core rules have a higher priority than any of the plugins's rules.

A plugin/rule 's function is defined as follows:
```
rule:: (error messages database, validation function, invalidation function, event, error's selector, value, expected[optional], fieldsObj[optional]) -> void
```
To be an efficient rule, you need to :

- Return the call of the validation function if the value meets the requirement
- Return the call of the invalidation function if it doesn't
- Use the correponding message from the message database for errors
- Replace `%value%` with a value (usually the value that is given by the rule, sometimes the field's value itself) in the error message

Noticed that you can "implement" your own logic behind the scenes (for instance by replacing `%formVal%` by the input's value in your custom rule to let the user see what it typed wrong).

## Default/core rules
This part is subject to change, but right now `yavl` provides these rules:

*(user's input's type) name of the rule (value from config)*

- (number, number as string) min (number, number as string)
- (number, number as string) max (number, number as string)
- (as string) regex (javascript regex as string)
- (as string) minLength (as string)
- (as string) maxLength (as string)
- (as string) match (another field's name from the config file)
