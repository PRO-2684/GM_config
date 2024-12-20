# `GM_config`

English | [简体中文](./README_CN.md)

[![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/PRO-2684/GM_config/total?logo=github)](https://github.com/PRO-2684/GM_config/releases)
[![](https://img.shields.io/badge/Crazy%20Thur.-V%20me%2050-red?logo=kfc)](https://greasyfork.org/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWZvIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--10e04ed7ed56ae18d22cec6d675b34fd579cecab/wechat.jpeg?locale=zh-CN)

Simple yet powerful config lib for userscripts. ([Greasy Fork](https://greasyfork.org/scripts/470224)) ([GitHub](https://github.com/PRO-2684/GM_config))

## 🎉 Features

- **Automatically update the menu** when config is modified (by either user or script)
- Support **listeners for config get/set**
- Support **multi-tab synchronization**
- Support **folders** (nested config items)
- Support either auto or manual menu registration
- Highly **customizable**
    - Customizable config value input method (`prop.input`)
    - Customizable processors for user inputs (`prop.processor`)
    - Customizable menu command display (`prop.formatter`)
- Automatically delete user config that is equal to default value, in order to save storage space

<details><summary>🖼️ Example Screenshot</summary>

![test_config](images/test_config.jpg)

</details>

## 🤔 Pre-requisites

This library needs the following permissions to work:

- `GM_setValue`: Save your config
- `GM_getValue`: Get your config
- `GM_deleteValue`: Automatically delete your config (Optional. If granted, this lib will delete user config that is equal to default value)
- `GM_registerMenuCommand`: Register menu
- `GM_unregisterMenuCommand`: Update menu
- `GM_addValueChangeListener`: Listen for config changes

To include this library in your script, you can choose one of the following methods:

| Source         | Original | Minified |
| -------------- | -------- | -------- |
| [GitHub Release](https://github.com/PRO-2684/GM_config/releases) | 🟢      | 🟢       |
| [GitHub Raw](https://github.com/PRO-2684/GM_config/blob/main/config.js)     | 🟢      | 🔴       |
| [GreasyFork](https://greasyfork.org/scripts/470224)     | 🔴      | <span title="Update check once a day">🟡*</span>      |

GitHub Release (Minified) is the recommended source. Take that for example, you can include it in your script like this:

```javascript
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://github.com/PRO-2684/GM_config/releases/download/<version>/config.min.js
```

Where `<version>` is the version you want to include (like `v1.2.0`). If only for testing, you can directly `@require` the [latest version](https://github.com/PRO-2684/GM_config/releases/latest/download/config.min.js).

If your script is to be posted to GreasyFork, you may need to add **Subresource Integrity** checks. Simply append `#md5=<md5>` after the `@require`d URL, where `<md5>` is the MD5 hash of the file. You can find the calculated hash at individual release pages.

## 🚀 Quick start

To begin with, you'll need an `Object` to describe how your config is structured. This is termed "config description". Here's an example of a simple config description:

```javascript
const configDesc = {
    price: { // Config item id, sometimes called "prop"
        name: "Price", // Display name
        type: "int", // Type of the config item
        value: 100 // Default value
    },
    name: {
        name: "Name",
        type: "str",
        value: "John Doe"
    }
};
```

You might want to restrict the range of the integer value. No problem, you can use `min` and `max` to do so. Here's an example:

```javascript
const configDesc = {
    price: {
        name: "Price",
        type: "int",
        value: 100,
        min: 1, // There's no such thing as a free lunch
        max: 1000 // I can't afford it!
    },
    // ...
}
```

In this way, you've restricted the value in range $[1, 1000]$. Also, you might want a boolean value or a switch. No worries, we've got you covered - simply use `"bool"` as the `type`. For a complete list of supported types and their usage, kindly refer to the [documentation](#proptype).

After defining your config description, it's time to register it. Here's how you can do it:

```javascript
const config = new GM_config(configDesc); // Register menu
```

Quite simple, right? Now you can start using your config. Normally, you want to **query** your config values, **modify** them programmatically under certain conditions, and **listen** for changes for dynamic updates. Here's how you can do it:

```javascript
console.log(config.get("price")); // Query config
config.set("price", 100); // Modify config (The displayed menu will be updated automatically)
config.addEventListener("set", (e) => {
    const { prop, before, after } = e.detail;
    console.log(`Config ${prop} is modified from ${before} to ${after}`);
});
```

Now that you've successfully set up a simple config menu for your script, it's time to dive deeper into the [documentation](#documentation) to explore more advanced features.

## 📖 Documentation

### Determine version

```javascript
console.log(GM_config.version); // *Print version*
```

### Config description

The first step is to define your config description, which is a dictionary and each of its key (apart from possible `$default`) represents the id of a config item. Note that no `.` is allowed in the id.

#### `$default`

By using `$default`, you can easily create a lot of config items of the same type. If `$default` is not specified in config description, following values will be used to fill unspecified fields in a config item:

```javascript
{ // Priority: Lowest
    type: "string",
    input: "prompt",
    processor: "same",
    formatter: "normal"
}
```

If you'd like to modify the default value, you may provide `$default` in your config description to override the above default values. Note that specifying `prop.type` doesn't work here, and subfolders will **inherit** `$default`. e.g.:

```javascript
const configDesc = {
    "$default": { // Priority: Low
        value: true,
        input: "current",
        processor: "not",
        formatter: "boolean"
    },
    switch_true: {
        name: "Switch true"
    },
    switch_false: {
        name: "Switch false",
        value: false // Priority: Highest
    }
}
```

Usually, however, the following `prop.type` is the best choice to quickly set up similar config items, and `$default` is solely used for setting `autoClose` to `false`:

```javascript
const configDesc = {
    "$default": {
        autoClose: false
    },
    // ...
}
```

#### `prop.type`

The type of the config item, used for quickly setting up common properties. Currently supported types are:

- `str`: String, defaulting to `""`
- `bool`: Boolean, defaulting to `false`
- `int`: Integer, defaulting to `0`
    - If `prop.min` is provided, it will check if the value is greater than or equal to it
    - If `prop.max` is provided, it will check if the value is less than or equal to it
- `float`: Float, defaulting to `0.0`
    - If `prop.min` is provided, it will check if the value is greater than or equal to it
    - If `prop.max` is provided, it will check if the value is less than or equal to it
- `enum`: Enumerate
    - `prop.options`: An array of strings, each representing an option for display, defaulting to `["A", "B", "C"]`
    - By clicking the menu item, the user can cycle through the options
    - Note that `prop.options` is only from the user's perspective, and the value actually used is the **index** of the option (cycles from 0 to `prop.options.length - 1`)
    - You should assign a valid non-negative integer less than `prop.options.length` to `prop.value`, defaulting to `0` if not specified
- `action`: Calls function(s) when clicked
    - You should not override `prop.input` and `prop.processor` for this type
    - Listen for this property's `get` events using `config.addEventListener` to set up callback(s)
- `folder`: A folder that contains other config items
    - You should override `prop.items` to create config items in this folder, which should be in the same format as the top-level config description `configDesc`
    - You may use `$default` in a folder
    - You may nest folders as many as you like
    - Use `prop.folderDisplay` to customize how a folder is displayed
        - `prefix`: Prefix of subfolder names. Default value is empty string.
        - `suffix`: Suffix of subfolder names. Default value is ` >`.
        - `parentText`: The text indicating going up a level. Default value is `< Back`.
        - `parentTitle`: The title of going up a level. Default value is `Return to parent folder`.
    - Use dotted names to access nested config items, i.e.
        - `config.get("folder1.folder2.item")`
        - `config.proxy["folder1.folder2.item"]`
        - `config.proxy.folder1.folder2.item`
        - `config.proxy["folder1.folder2"].item`

You may use it like this:

```javascript
const configDesc = {
    switch_true: {
        name: "Switch true",
        type: "bool" // Priority: High
    },
    switch_false: {
        name: "Switch false",
        type: "bool", // Priority: High
        value: false // Priority: Highest
    }
}
```

#### `prop.name`

The display name of the config item. Expected type: `string`.

#### `prop.value`

The default value of the config item, can be of any type. Note that you should consider its validity, because this lib will not check default value's validity for you.

#### `prop.input`

> `(prop, orig, desc) => input`

How to get user input. Expected a string (built-in input method) or a function (invoked when user clicks the menu item). If not specified by both `prop.input` and `$default.input`, `prompt` will be used, i.e. ask for user input using `prompt()`. Note that "user input value" does not necessarily have to be actually input by user, it can be provided by script. (e.g. built-in input method `current`).

Arguments of the function:

- `prop`: The id of the config item
- `orig`: Current value
- `desc`: Config description of current config item (`desc.` conveys the same meaning as `prop.`)

Built-in input functions:

- `prompt`: Ask for user input using `prompt()` (default value)
- `current`: Current value will be used as user input (Usually used with `prop.processor=not` so as to create a switch, or with custom `processor` to create a generator)
- `action`: Dispatches a `get` event and returns the original value. Will `autoClose` the menu to indicate that the click is successful. (Used internally by `action` type)
- `folder`: Goes down the given folder specified by the config item's id. After this, dispatches a `get` event and returns the original value. Will not `autoClose` the menu. (Used internally by `folder` type)

#### `prop.processor`

> `(prop, input, desc) => stored`

Process user input and return the value to be stored. Expected a string (built-in processor) or a function. **Throw error** if user input is invalid. If not specified by both `prop.formatter` and `$default.formatter`, `same` will be used, i.e. return user input directly. A common use case is to convert user input to integers or floats.

Arguments of the function:

- `prop`: The id of the config item
- `input`: User input
- `desc`: Config description of current config item

Built-in processors:

- `same`: Return user input directly
- `not`: Invert boolean value (Usually used with `prop.input=current` so as to create a switch)
- `int`: Convert to integer in given range (if specified)
    - If `prop.min` is provided, it will check if the value is greater than or equal to it
    - If `prop.max` is provided, it will check if the value is less than or equal to it
- `float`: Convert to float in given range (if specified)
    - If `prop.min` is provided, it will check if the value is greater than or equal to it
    - If `prop.max` is provided, it will check if the value is less than or equal to it
- `enum`: Adds $1$ to the input and mods `prop.options.length` (Used internally by `enum` type)

#### `prop.formatter`

> `(prop, value, desc) => string`

Controls the text to be displayed on the menu. Expected a string (built-in formatter) or a function. If not specified by both `prop.formatter` and `$default.formatter`, `normal` will be used.

Arguments of the function:

- `prop`: The id of the config item
- `value`: The value of the config item
- `desc`: Config description of current config item

Built-in formatters:

- `normal`: Display in the format of `name: value`
- `boolean`: Display method for boolean values - `true` will be displayed as `name: ✔`, `false` will be displayed as `name: ✘`.
- `enum`: Display in the format of `name: option`, where `option` is `prop.options[value]` (Used internally by `enum` type)
- `name_only`: Only show the name of the config item (Used internally by `action` type)
- `folder`: Wrap the name with `prop.folderDisplay.prefix` and `prop.folderDisplay.suffix`. (Used internally by `folder` type)

#### `prop.hidden`

> `boolean`

Whether to hide the config item. If set to `true`, the config item will not be displayed in the menu, but you can still access or modify it using `config.get` and `config.set`.

#### Other Tampermonkey provided properties

Supports `prop.accessKey`, `prop.autoClose`, `prop.title` (Require TM >=4.20.0). If a function is provided, it will be called with argument `prop`, `value` and `desc`, just like custom `prop.formatter`s. The returned value will be passed to Tampermonkey. See [Tampermonkey docs](https://www.tampermonkey.net/documentation.php#api:GM_registerMenuCommand) for details.

#### Priorities

The priority of the properties is as follows (from highest to lowest):

1. The properties you explicitly set for each config item
2. The properties implied by the `type` of the config item
3. The properties you set for `$default` in this folder
4. Calculated `$default` for parent folder
5. The default values for `$default`

### Register menu

After defining your config description, you can register the menu item by constructing a `GM_config` instance. The constructor accepts the following two arguments:

- `configDesc`: Your config description
- `options`: Options (optional)
    - `immediate`: Whether to register the menu items immediately.
        - If set to `true`, the menu item will be registered immediately. (default value)
        - If set to `false`, the user need to click "Show configuration" to register it.
    - `debug`: Whether to enable debug mode. If set to `true`, debug information will be printed to console. Default value is `false`. (Can be modified by `config.debug` at any time)

```javascript
const config = new GM_config(configDesc, { immediate: false }); // *Register menu*
console.log(config.get("price")); // *You may now start using the config 🎉*
```

### Get/set/list config

After registering the menu, you can get/set/list config by calling `.get(prop)`, `.set(prop, value)` and `.list(path)` on the instance respectively. e.g:

```javascript
console.log(config.get("price")); // *Get config*
config.set("price", 100); // *Modify config* (The menu will be updated automatically)
console.log(config.list("someFolder.folder")); // *List config items in someFolder.folder*
```

Alternatively, operate on `config.proxy` to get/set/list config. e.g:

```javascript
console.log(config.proxy.price); // *Get config*
config.proxy.price = 100; // *Modify config* (The menu will be updated automatically)
// *List config items in someFolder.folder*
for (const [prop, value] of Object.entries(config.proxy.someFolder.folder)) {
    console.log(prop, value);
}
console.log(Object.keys(config.proxy.someFolder.folder));
```

Since no `.` is allowed in the id, you could also do this:

```javascript
console.assert(config.proxy["someFolder.folder"].nothing === config.proxy.someFolder.folder.nothing);
```

### Listen for config get/set

You can listen for config get/set by calling `config.addEventListener(type, listener, options?)`:

```javascript
config.addEventListener("set", (e) => {
    console.log(e.detail); // *Config is modified*
});
config.addEventListener("get", (e) => {
    console.log(e.detail); // *Config is accessed*
});
```

`e.detail` is a dictionary with the following properties:

- `prop`: The id of the config item accessed/modified. Use dots to represent nested config items.
- `before`: The value of the config item before the operation.
- `after`: The value of the config item after the operation.
- `remote`: Indicating whether this modification is caused by other script instances. Always `false` for `get` event (cannot detect other instances' accesses).

It should be noted that:

- `get` event is only triggered when the config is accessed by current script instance
- `set` event is triggered when the config is modified from *any sources*, making multi-tab synchronization possible

As you might have expected, you can remove the listener by calling `config.removeEventListener(type, listener, options?)`. These two methods are inherited from [`EventTarget.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [`EventTarget.removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener).

This feature is often used to update your script dynamically when config is modified. In this lib, auto-updating menu is implemented by this feature.

### Programmatic folder navigation

You can call `config.up()` and `config.down(name)` to navigate up and down the folder hierarchy, and `config.currentPath` to check the current path. To be specific:

- `config.up()`: Go up one level. If already at the top level, simply re-register. Returns a `string` indicating the parent folder, or `null` if already at the root.
- `config.down(name)`: Go down to the folder specified by `name`. If `name` is not a folder, do nothing. Returns `true` if successfully navigated, `false` otherwise.
- `config.currentPath`: A list of `string`, each representing a folder, in the order from the root to the current folder. Note that this property is read-only.

### Sum up: the process of modifying config

1. User clicks the menu command
2. Pass `prop.name` and current value to `prop.input` to get user input
3. Pass user input to `prop.processor` to get processed value
4. Save processed value
5. Dispatch event with corresponding detail
6. Update menu command (triggered by the event)

### Sum up: operating on `config.proxy` vs `config`

| Operation | `config` | `config.proxy` |
| --- | --- | --- |
| Get config | `config.get("price")` | `config.proxy.price` |
| Set config | `config.set("price", 100)` | `config.proxy.price = 100` |
| List config | `config.list("someFolder.folder")` | `Object.keys(config.proxy.someFolder.folder)` |

Internally, all operations on `config.proxy` are mapped to operations on `config`.

## 👀 Working example

Install [this test code](./test_config.user.js), and see how does it work; Or you can try out this lib in action with [Greasy Fork Enhance](https://greasyfork.org/scripts/467078).

## ⚠️ Note

This project is in early development, and the API may change in the future. If you have any suggestions or find any bugs, please feel free to open an issue or pull request.
