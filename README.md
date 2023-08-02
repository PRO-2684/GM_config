# `GM_config`

[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

## 🪄 Function

Simple config lib for Tampermonkey scripts. ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/gadgets/tree/main/GM_config))

## 🎉 Features

- **Automatically update the menu** when config is modified (by either user or script)
- Support **listeners for config get/set**
- Support either auto or manual menu registration
- Highly **customizable**
    - Customizable config value input method (`prop.input`)
    - Customizable processors for user inputs (`prop.processor`)
    - Customizable menu command display (`prop.formatter`)

## 🤔 Permission

This library needs the following permissions to work:

```javascript
// @grant        GM_setValue // Save your config
// @grant        GM_getValue // Get your config
// @grant        GM_registerMenuCommand // Register menu
// @grant        GM_unregisterMenuCommand // Update menu
```

**Delete the comment** if you copied and pasted the code, or there might be errors. You may want to delete `@grant none` (if present). If you used `window` object in your script, try `@grant unsafeWindow` and then `let window = unsafeWindow`.

## 📖 Usage

### Config description

The first step is to define your config description, which is a dictionary and each of its key represents the id of a config item. Each config item is a dictionary with the following properties: (`*` means required, else optional)

#### `prop.name` *

The display name of the config item. Expected type: `string`.

#### `prop.value` *

The default value of the config item, can be of any type. Note that you should consider its validity, because this lib will not check default value's validity for you.

#### `prop.input`

> `(prop, orig) => input`

How to get user input. Expected a string (built-in input method) or a function (invoked when user clicks the menu command). It **accepts the name of config item and returns user input**. If not specified, the default value will be `prompt`, i.e. ask for user input using `prompt()`. Note that "user input value" does not necessarily have to be actually input by user, it can be provided by script. (e.g. built-in input method `current`).

Built-in input methods:

- `prompt`: Ask for user input using `prompt()` (default value)
- `current`: Current value will be used as user input (Usually used with `prop.processor=not` so as to create a switch, or with custom `processor` to create a generator)

#### `prop.processor`

> `(input) => stored`

How to process user input. Expected a string (built-in processor) or a function. It **accepts user input and returns value to be stored**. **Throw error** if user input is invalid. If not specified, the default value will be `same`, i.e. return user input directly. A common use case is to convert user input to integers or floats.

Built-in processors:

- `same`: Return user input directly (default value)
- `not`: Invert boolean value (Usually used with `prop.input=current` so as to create a switch)
- `int`: Convert to integer
- `int_range-min-max`: Convert to integer in range `[min, max]`
    - It is not advisable to omit `-`, because there might be errors.
    - `<min>` and `<max>` can be any integer. Not provided inferred as no limit on that side.
- `float`: Convert to float
- `float_range-min-max`: Convert to float in range `[min, max]`
    - It is not advisable to omit `-`, because there might be errors.
    - `<min>` and `<max>` can be any float. Not provided inferred as no limit on that side.

#### `prop.formatter`

> `(name, value) => string`

How to display the menu command. Expected a string (built-in formatter) or a function. It **accepts the name of config item and its current value, and returns the text to be displayed on the menu**. If not specified, the default value will be `default`, i.e. in the format of `name: value`.

Built-in formatters:

- `default`: Display in the format of `name: value` (default value)
- `boolean`: Display method aimed for boolean values. `true` will be displayed as `name: ✔`, `false` will be displayed as `name: ✘`.

### Register menu

After defining your config description, you can register the menu command by calling `GM_config`. It accepts the following two arguments:

- `config_desc`: Your config description
- `menu`: Whether to register the menu command automatically.
    - If set to `true`, the menu command will be registered automatically. (default value)
    - If set to `false`, the user need to click "Show configuration" to show it.

```javascript
let config = GM_config(config_desc, false); // *Register menu command*
console.log(config.price); // *You may now start using the config 🎉*
```

### Get/set config

After registering the menu command, you can get/set config by accessing the object returned by `GM_config`. e.g:

```javascript
console.log(config.price); // *Get config*
config.price = 100; // *Modify config* (The menu will be updated automatically)
```

### Listen for config get/set

This lib provides a string `GM_config_event`, whose value represents the event that will be triggered when config is get/set. You can listen for this event by calling `window.addEventListener`. e.g:

```javascript
window.addEventListener(GM_config_event, (e) => { // *Listen for config get/set*
    console.log(config, e.detail);
});
```

`e.detail` is a dictionary with the following properties:

- `prop`: The id of the config item accessed/modified.
- `type`: The type of the operation. Might be one of the following:
    - `get`: the config item is accessed
    - `set`: the config item is modified
- `before`: The value of the config item before the operation.
- `after`: The value of the config item after the operation.

This feature is often used to update your script when config is modified. In this lib, auto-updating menu is implemented by listening for this event.

### To sum up: the process of modifying config

1. User clicks the menu command
2. Pass `prop.name` and current value to `prop.input` to get user input
3. Pass user input to `prop.processor` to get processed value
4. Save processed value
5. Dispatch `GM_config_event` with corresponding detail
6. Update menu command (triggered by `GM_config_event`)

## 👀 Working example

Install below code as a script, and see how does it work:

```javascript
// ==UserScript==
// @name         Test Config
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  This is an example to demostrate the usage of greasyfork.org/scripts/470224.
// @author       PRO
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/vite/assets/blacklogo16-bc64b9f7.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://greasyfork.org/scripts/470224-tampermonkey-config/code/Tampermonkey%20Config.js
// @license      gpl-3.0
// ==/UserScript==

(function() {
    'use strict';
    let config_desc = { // Config description
        password: {
            name: "Password", // Display name
            value: "tmp", // Default value
            input: "prompt", // How to get user input (Invoked when user clicks the menu command)
            // Built-in values:
            // "current": Current value will be passed to `processor` as user input (generator-like)
            // "prompt": Use `prompt` to get user input (default value)
            // <function>: Custom function to get user input, should return certain value to be processed by `processor`
            //     (prop, orig) => input
            processor: (v) => {
                if (v.length < 3) throw "Too short!";
                return v;
            }
        },
        enabled: {
            name: "Enabled",
            value: true,
            input: "current",
            processor: "not", // Process user inputs, throw error if invalid
            // Built-in processors:
            // "same": Return user input directly (default value)
            // "not": Invert boolean value
            // "int": Convert to integer
            // "int_range-min-max": Convert to integer in range [min, max], raise error if invalid ("" for no limit)
            // "float": Convert to float
            // "float_range-min-max": Convert to float in range [min, max], raise error if invalid ("" for no limit)
            // <function>: Custom function to process value
            //     (input) => stored
            formatter: "boolean", // Format value to be displayed in menu command
            // Built-in formatters:
            // "default": `${name}: ${value}`
            // "boolean": `${name}: ${value ? "✔" : "✘"}`
            // <function>: Custom function to format value
            //     (name, value) => string
        },
        val: {
            name: "Float",
            value: 11.4,
            processor: "float_range-0-" // Convert to float in range [0, +∞)
        }
    }
    let config = GM_config(config_desc, false); // Register menu commands
    window.addEventListener(GM_config_event, (e) => { // Listen to config changes
        console.log(e.detail);
    });
    window.setTimeout(() => { // Change config values, and menu commands will be updated automatically
        config.val += 1; // Remember to validate the value before setting it
    }, 5000);
})();
```

## ⚠️ Note

- This project is in early development.