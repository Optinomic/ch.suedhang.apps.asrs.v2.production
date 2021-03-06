
    calc.flatten = function(target, opts) {
        opts = opts || {}

        var delimiter = opts.delimiter || '.'
        var maxDepth = opts.maxDepth
        var output = {}


        function step(object, prev, currentDepth) {
            currentDepth = currentDepth || 1
            Object.keys(object).forEach(function(key) {
                var value = object[key]
                var isarray = opts.safe && Array.isArray(value)
                var type = Object.prototype.toString.call(value)
                // var isbuffer = isBuffer(value)
                var isbuffer = false
                var isobject = (
                    type === '[object Object]' ||
                    type === '[object Array]'
                )

                var newKey = prev ?
                    prev + delimiter + key :
                    key

                if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
                    (!opts.maxDepth || currentDepth < maxDepth)) {
                    return step(value, newKey, currentDepth + 1)
                }

                output[newKey] = value
            })
        }

        step(target)

        return output
    };

    calc.unflatten = function(target, opts) {
        opts = opts || {}

        var delimiter = opts.delimiter || '.'
        var overwrite = opts.overwrite || false
        var result = {}

        var isbuffer = false
        if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
            return target
        }

        // safely ensure that the key is
        // an integer.
        function getkey(key) {
            var parsedKey = Number(key)

            return (
                    isNaN(parsedKey) ||
                    key.indexOf('.') !== -1 ||
                    opts.object
                ) ? key :
                parsedKey
        }

        var sortedKeys = Object.keys(target).sort(function(keyA, keyB) {
            return keyA.length - keyB.length
        })

        sortedKeys.forEach(function(key) {
            var split = key.split(delimiter)
            var key1 = getkey(split.shift())
            var key2 = getkey(split[0])
            var recipient = result

            while (key2 !== undefined) {
                var type = Object.prototype.toString.call(recipient[key1])
                var isobject = (
                    type === '[object Object]' ||
                    type === '[object Array]'
                )

                // do not write over falsey, non-undefined values if overwrite is false
                if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
                    return
                }

                if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
                    recipient[key1] = (
                        typeof key2 === 'number' &&
                        !opts.object ? [] : {}
                    )
                }

                recipient = recipient[key1]
                if (split.length > 0) {
                    key1 = getkey(split.shift())
                    key2 = getkey(split[0])
                }
            }

            // unflatten again for 'messy objects'
            recipient[key1] = unflatten(target[key], opts)
        })

        return result
    };

    calc.getFieldsArray = function(object) {
        var return_array = [];
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                var def = {
                    "path": property,
                    "example_data": object[property]
                };
                return_array.push(def);
            };
        };
        return return_array;
    };

    calc.findFirstAllFound = function(sr) {
        var return_object = null;
        var BreakException = {};

        try {
            sr.forEach(function(fsr, fsrID) {
                if (fsr.all_found === true) {
                    return_object = fsr;
                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }

        return return_object;
    };