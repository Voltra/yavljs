(function UniversalModuleDefinition(root, factory){
	if(typeof module === 'object')
        module.exports = factory();
    else{
		var module_name = "yavl";
		if(typeof define === 'function' && define.amd)
			define(module_name, [], factory);
		else
			if(typeof exports === 'object')
				exports[module_name] = factory();
			else
				root[module_name] = factory();
	}
})(this, function(){
    if(!("some" in Array.prototype)){
        Array.prototype.some = function(predicate){
            for(var i = 0 ; i < this.length ; ++i){
                if(predicate(this[i]))
                    return true;
            }
            
            return false;
        };
    }
    
    /**Yet Another Validation Library
    *@class yavl
    */
    var yavl = function(formSelector, fields={}, localeObj={}, validate, invalidate){
        Object.defineProperty(this, "locale", {
            value: Object.assign({
                "NaN": "Invalid format (NaN)",
                "required": "This field is required",
                "min": "Must be &ge; %value%",
                "max": "Must be &le; %value%",
                "nomatch_regex": "Invalid format",
                "minLength": "Expects a minimum of %value% characters",
                "maxLength": "Expects a maximum of %value% characters",
                "notEqual": "Value mismatch"
            }, localeObj)
        });

        Object.defineProperty(this, "form", {
            value: document.querySelector(formSelector)
        });

        Object.defineProperty(this, "fields", {
            value: fields
        });

        if(typeof validate == "function")
            this.setValidationFunction(validate);
        else
            this.setValidationFunction(function(es){
                document.querySelector(es).innerHTML = "";
            });


        if(typeof invalidate == "function")
            this.setInvalidationFunction(invalidate);
        else
            this.setInvalidationFunction(function(event, es, msg){
                event.preventDefault();
                document.querySelector(es).innerHTML = msg;
                return true;
            });
    }
    /**@@ Core Functioning @@**/

    //validate: (error_selector) -> void
    //invalidate: (event, error_selector, err_msg) -> true
    //
    //rule:: (errorMsgDB, validate, invalidate, event, error_sel, value, expected?, fieldsObj?) -> true/false

    yavl.prototype.validateForm = function(event){
        var YAVL = this;
        Object.values(YAVL.fields).forEach(function(field){ //always validate all fields
            const isFilled = document.querySelector(field.selector).value!=="";
            if(yavl.parseBool(field.required) || isFilled){
                var val = document.querySelector(field.selector).value;

                if(yavl.parseBool(field.required)){
                    if(!isFilled)
                        return YAVL.invalidate(event, field.error_selector, YAVL.locale["required"]);
                    else
                        YAVL.validate(field.error_selector);
                }

                if(field.rules){
                    switch(field.type){
                        case "int":
                            val = parseInt(val);
                            if(yavl.isNaN(val))
                                return YAVL.invalidate(event, field.error_selector, YAVL.locale["NaN"]);
                            break;
                        case "float":
                            val = parseFloat(val);
                            if(yavl.isNaN(val))
                                return YAVL.invalidate(event, field.error_selector, YAVL.locale["NaN"]);
                            break;
                        case "bool":
                            val = yavl.parseBool(val);
                            break;
                        default:
                            break;
                    }

                    const rules = field.rules;

                    const coreRules = Object.keys(yavl.prototype)
                                        .filter(function(key){
                                            return RegExp(yavl.coreBaseName + "\\w+").test(key);
                                        }).map(function(key){
                                            return key.replace(yavl.coreBaseName, "");
                                        });

                    const pluginRules = Object.keys(yavl.prototype)
                                        .filter(function(key){
                                            return RegExp(yavl.pluginBaseName + "\\w+").test(key);
                                        }).map(function(key){
                                            return key.replace(yavl.pluginBaseName, "");
                                        });

                    Object.keys(rules).some(function(rule){
                        if(coreRules.indexOf(rule) >= 0)
                            return YAVL[yavl.coreBaseName + rule](
                                YAVL.locale,
                                YAVL.validate.bind(YAVL),
                                YAVL.invalidate.bind(YAVL),
                                event,
                                field.error_selector,
                                val,
                                rules[rule],
                                YAVL.fields
                            );
                        else if(pluginRules.indexOf(rule) >= 0)
                            return YAVL[`${yavl.pluginBaseName}${rule}`](
                                YAVL.locale,
                                YAVL.validate.bind(YAVL),
                                YAVL.invalidate.bind(YAVL),
                                event,
                                field.error_selector,
                                val,
                                rules[rule],
                                YAVL.fields
                            );
                    });
                }
            }
        });
    };

    /**@@ Helpers @@**/

    //validate: (error_selector) -> void
    //invalidate: (event, error_selector, err_msg) -> true

    Object.defineProperty(yavl, "coreBaseName", {
        value: "yavl_validate_",
        enumerable: true
    });

    Object.defineProperty(yavl, "pluginBaseName", {
        value: "yavlPlugin_",
        enumerable: true
    });

    Object.defineProperty(yavl, "isNaN", {
        value: function(arg){ return arg!==arg },
        enumerable: true
    });

    Object.defineProperty(yavl, "parseBool", {
        value: function(val){
            const toParse = ""+val;

            const boolPattern = /((true|false|0|1))/i;

            const matches = boolPattern.exec(toParse)

            const result = (matches ? matches[0] : "");

            switch(result){
                case "1":
                case "true":
                    return true;

                case "0":
                case "false":
                    return false;

                case "":
                default:
                    return null;
            };
        },
        enumerable: true
    });

    //Setter for the validation function
    yavl.prototype.setValidationFunction = function(functor){
        if(typeof functor == "function"){
            if(functor.length === 1)
                Object.defineProperty(this, "validate", {
                    value: functor
                });
            else
                throw new Error("The validation MUST accept one argument : the selector to the error message 'holder'.");
        }else
            throw new TypeError("The validation function MUST be a Function.");
    };

    //Setter for the invalidation function
    yavl.prototype.setInvalidationFunction = function(functor){
        if(typeof functor == "function"){
            if(functor.length === 3)
                Object.defineProperty(this, "invalidate", {
                    value: functor
                });
            else
                throw new Error("The validation MUST accept three arguments : the event, the selecto to the error message 'holder' and the error message itself.");
        }else
            throw new TypeError("The validation function MUST be a Function.");
    };


    /**@@ Core Rules @@**/

    //rule:: (errorMsgDB, validate, invalidate, event, error_sel, value, expected?, fieldsObj?) -> true/false
    //validate:: (error_selector) -> void
    //invalidate:: (event, error_selector, error_message) -> true

    /**Rule to satisfy a minimum
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {number} val - The actual value extracted from the form
    *@param {number} ex - The "expected" value (here the reference for the minimum)
    *
    */
    yavl.prototype[yavl.coreBaseName + "min"] = function(errorMsgDB, validate, invalidate, event, es, val, ex){
        if(val >= ex)
            validate(es);
        else
            return invalidate(event, es, errorMsgDB["min"].replace("%value%", ex));
    }

    /**Rule to satisfy a maximum
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {number} val - The actual value extracted from the form
    *@param {number} ex - The "expected" value (here the reference for the maximum)
    *
    */
    yavl.prototype[yavl.coreBaseName + "max"] = function(errorMsgDB, validate, invalidate, event, es, val, ex){
        if(val <= ex)
            validate(es);
        else
            return invalidate(event, es, errorMsgDB["max"].replace("%value%", "" + ex));
    }

    /**Rule to match a specified regex
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {String} val - The actual value extracted from the form
    *@param {String} ex - The regex (as a String ready to be passed to RegExp) the value must match
    *
    */
    yavl.prototype[yavl.coreBaseName + "regex"] = function(errorMsgDB, validate, invalidate, event, es, val, ex){
        if(RegExp(ex).exec("" + val))
            validate(es);
        else
            return invalidate(event, es, errorMsgDB["nomatch_regex"].replace("%value%", "" + ex));
    }

    /**Rule to satisfy a minimum amount of character
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {?} val - The actual value extracted from the form
    *@param {number} ex - The minimum amount of character
    *
    */
    yavl.prototype[yavl.coreBaseName + "minLength"] = function(errorMsgDB, validate, invalidate, event, es, val, ex){
        if(("" + val).length >= parseInt(ex))
            validate(es);
        else
            return invalidate(event, es, errorMsgDB["minLength"].replace("%value%", "" + ex));
    }

    /**Rule to satisfy a minimum amount of character
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {?} val - The actual value extracted from the form
    *@param {number} ex - The minimum amount of character
    *
    */
    yavl.prototype[yavl.coreBaseName + "maxLength"] = function(errorMsgDB, validate, invalidate, event, es, val, ex){
        if(("" + val).length <= parseInt(ex))
            validate(es);
        else
            return invalidate(event, es, errorMsgDB["maxLength"].replace("%value%", "" + ex));
    }

    /**Rule to match the value of another field
    *
    *@param {Object} errorMsgDB - "Database" of the error messages passed via dependecy injection
    *@param {Function} validate - Validation function passed via dependency injection
    *@param {Function} invalidate - Invalidation function passed via dependency injection
    *
    *@param {Event} event - the form's submission event
    *@param {String} es - the CSS selector to the DOMNode that will contain the related error message
    *@param {String} val - The actual value extracted from the form (directly as the string)
    *@param {String} ex - The "name" of the field to match (name in config, not the HTML attribute)
    *@param {Objet} fields - An object (similar to config) containing the other fields (config like)
    *
    */
    yavl.prototype[yavl.coreBaseName + "match"] = function(errorMsgDB, validate, invalidate, event, es, val, ex, fields){
        const otherNodeValue = document.querySelector(fields[ex].selector).value;

        if(otherNodeValue !== "" + val)
            return invalidate(event, es, errorMsgDB["notEqual"].replace("%value%", "" + ex));
        else
            validate(es);
    }

    /**@@ Custom Rules @@**/

    //Register a rule
    yavl.registerRule = function(name, functor){
        if(typeof name != "string")
            throw new TypeError("The name of the plugin MUST be a string.");

        if(typeof functor != "function")
            throw new TypeError("The callback MUST be a function.");

        //plugin:: (errMsgDB, validate, invalidate, event, error_sel, value, expected?, fieldsObj?) -> true/false
        if([6, 7, 8].indexOf(functor.length) < 0)
            throw new Error("The plugin's callback MUST follows this pattern : '(errMsgDB, validate, invalidate, event, error_sel, value, expected, otherFieldArr?) -> true/false'.");

        yavl.prototype[yavl.pluginBaseName + name] = functor;
    };

    //Remove a rule
    yavl.removeRule = function(name){
        if(typeof name != "string")
            throw new TypeError("The name of a plugin IS a string.");

        if((yavl.pluginBaseName + name) in yavl.prototype)
            delete yavl.prototype[yavl.pluginBaseName + name];
    }
    
    
    return yavl;
});