# fetchJSON #
A Javascript library that allows to abstract all boilerplate from retrieving JSON data using the native ES6 fetch API.


----------



Simple and easy to use, it only abstracts away all the boilerplate required for fetching json data.
No other javascript library is required to use this library.


----------
## Installation/Use ##
Just like every library should, I tried to make fetchJSON compatible with quite everything I am aware of.

fetchJSON currently supports regular use (via HTML script tag), npm and require (and commonJS), AMD (and probably ES6 modules ?).

Therefore, here are two ways to install this library:
***Without NPM***
```html
<html>
	<!-- [...] -->
	<head>
		<!-- [...] -->
		<script src="path/to/fetchJSON.js"></script>
		<!-- [...] -->
	</head>
	<!-- [...] -->
</html>
```

***With NPM***
```
npm install fetch_json
```
```javascript
const fetchJSON = require("fetch_json");
```

## Simple use case ##
Sometimes, you just have that json file which's sole purpose is configuration.
With fetchJSON, getting the data from this file is very easy:

```javascript
//With fetchJSON
let config_data;
fetchJSON("../../someFolder/someFile.json", data=>config_data=data);

//Without fetchJSON
let config_data;
fetch("../../someFolder/someFile.json").then(response=>{
	/*gather headers*/
	if(/*there's json in there*/)
		return response.json().then(data=>{
			/*some manipulation*/
			config_data = data;
			//finally !
		});
	else
		/*handle error*/
});

```

Once loaded, the data can be used like this: 
```javascript
let config_data;
fetchJSON("../../someFolder/someFile.json", data=>config_data=data)
.then(()=>{
	/* use config_data to configure your application*/
});
```

## Error Handling ##
One of the most important part of retrieving data asynchronously is error handling.
Sometimes you have server issues, sometimes you used an incorrect path and this can be a pain in the ass with regular fetch.

Version 1.0.5 (NPM, it's 1.05 on github) brings a whole new layer of abstracted boilerplate for error handling. Here's a simple example with, and without, fetchJSON.

```javascript
//with fetchJSON
let config_data;
fetchJSON("../../someFolder/someFile.json", data=>config_data=data)
.then(/*some manipulations*/)
.then(/*some manipulations*/)
.catch(errorMsg=>{
  /*handle errors here*/
});

//without fetchJSON
let config_data;
new Promise((resolve, reject)=>{
  fetch("../../someFolder/someFile.json").then(response=>{
        /*gather headers*/
        if(/*there's json in there*/)
        	return response.json().then(data=>{
        		/*some manipulation*/
        		config_data = data;
        		//finally !
        		resolve(data);//important
        	});
        else
        	reject(/*handle error*/)
    });
})
.then(/*some manipulations*/)
.then(/*some manipulations*/)
.catch(errorMsg=>{
  /*handle errors here*/
});
```
From version 1.0.5, fetchJSON is completely thenable and catchable just like any other good Promise-based library \o/ !

## Motivations ##
As you can see, fetchJSON really focuses on what's important : using the data. Whereas the regular fetch approach is mostly boilerplate and takes up a lot of space in your code, and most of that space is here solely to get the data not using it.

JSON is a precious resource, it would be a shame to spend more time on getting its data than using it.

## Questions/Suggestions ##
Please fill free to ask for help or post suggestions on my github repository, I'll be more than glad to take care of your problems/concerns.