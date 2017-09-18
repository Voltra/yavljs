/**@function fetchJSON
*use the Fetch API to retrieve data from a JSON file
*@param {string} path - the complete path to the file
*@param {function} functor - the function to which the JSON data will be passed
*
*@return the Promise object of the fetch request
*/

(function UniversalModuleDefinition(root, factory){
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define("fetchJSON", [], factory);
    else if(typeof exports === 'object')
        exports["fetchJSON"] = factory();
    else
        root["fetchJSON"] = factory();
})(this, function(){
    return function(path, functor){
        return new Promise((resolve, reject)=>{
            if(  (typeof functor == typeof (x=>x)) && (typeof path == typeof "42xyz")  ){
                const f = fetch(path);

                f.then((response)=>{
                    var contentType= response.headers.get("content-type");

                    if(contentType && contentType.includes("application/json"))
                        return response.json().then( jsonData=>{functor(jsonData); resolve(jsonData);} );
                    else{
                        //throw new Error("Something went wrong during data inspection (data is not JSON or couldn't reach file)");
                        reject("Something went wrong during data inspection (data is not JSON or couldn't reach file)");
                        return null;
                    }
                });

                return f;
            }
            else{
                //console.error("fetchJSON.js : The first argument must be a string, the second argument must be a function");
                if(typeof path != typeof "42xyz")
                    //throw new TypeError("The 1st argument must be a string");
                    reject("The 1st argument must be a string");
                if(typeof functor != typeof (x=>x))
                    reject("The 2nd argument must be a function");
                return null;
            }
        });
    }
});