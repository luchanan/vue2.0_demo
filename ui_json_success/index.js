function assert(assertion) {
    if (!assertion) {
        err();
    }
}

function checkType(type) {
    var typeAllowed = ['obj', 'array', 'text', 'input', 'checkbox', 'radio', 'textarea', 'select'];
    if (typeAllowed.indexOf(type) === -1) {
        err()
        return false
    }
}

function err() {
    console.error('ERROR!')
    throw new Error("ERROR!")
}

function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function getValue(keyChain, baseData) {
    // getValue(`package_info[0].package_details[1].name`, source_JSON)
    var reg = /[\[\]\.]/;
    var keys = keyChain.split(reg).filter((ele) => ele !== "");
    var thisVal = copyObj(baseData)
    keys.forEach((ele) => {
        thisVal = thisVal[ele]

    })
    return thisVal;
}

function concatKey(parent, child) {
    if (typeof child === 'string') {
        return `${parent}.${child}`
    } else {
        return `${parent}[${child}]`
    }
}

function renderNextId(parent, child) {
    var html = `<div id="${concatKey(parent, child)}"></div>`
    $(`#${jPath(parent)}`).append(html)
}

function jPath(str) { // "foo.bar[0]" escape=> "foo\\.bar\\[0\\]" for jQuery
    return str.replace(/\./g, "\\.").replace(/\[/g, "\\[").replace(/\]/g, "\\]")
}

function render(parentObj, parent, data) { // recursive
    var type = parentObj.type;
    function row(html = '') {
        var wrapper = `<el-row :gutter="16">${html}</el-row>`
        return wrapper
    }
    function span6(html = '') {
        var wrapper = `<el-col :span='6'>${html}</el-col>`
        return wrapper
    }
    function span18(html = '') {
        var wrapper = `<el-col :span='18'>${html}</el-col>`
        return wrapper
    }
    function descf(html) {
        return `<label class='desc-form'>${html}</label>`
    }
    function common(html = '', desc = '') {
        return row(`${span6(descf(desc))}${span18(html)}`)
    }
    var methods = {
        text() {
            var html = `<span class='text-form'>{{${parent}}}</span>`
            $(`#${jPath(parent)}`).append(common(html, parentObj.desc))
        },
        input() {
            var html = `<el-input v-model="${parent}"></el-input>`
            $(`#${jPath(parent)}`).append(common(html, parentObj.desc))
        },
        textarea() {
            var html = `<el-input type="textarea" v-model="${parent}"></el-input>`
            $(`#${jPath(parent)}`).append(common(html, parentObj.desc))
        },
        checkbox() {
            var html = `<el-checkbox v-model="${parent}">{{${parent}}}</el-checkbox>`
            $(`#${jPath(parent)}`).append(common(html, parentObj.desc))
        },
        obj() {
            Object.keys(parentObj.item).forEach((child) => {
                renderNextId(parent, child)
                render(parentObj.item[child], concatKey(parent, child), data);
        });
        },
        array() {
            getValue(parent, data).forEach((child, index) => {
                renderNextId(parent, index)
                render(parentObj.item, concatKey(parent, index), data)
        })
        }
    }

    checkType(type);
    methods[type]();
}

$(function () {
    var ui = {
        type: 'obj',
        item: {
            blabla: {
                type: 'array',
                desc: 'adsfaf',
                item: {
                    type: 'obj',
                    desc: 'adsfaf',
                    item: {
                        foo: {
                            type: 'input',
                            desc: 'adsfaf',
                        },
                        bar: {
                            type: 'obj',
                            desc: 'adsfaf',
                            item: {
                                foo:{
                                    type: 'input'
                                }
                            }
                        }
                    }
                }
            },
            lala: {
                type: 'obj',
                desc: 'adsfaf',
                item: {
                    a: {
                        desc: 'adsfaf',
                        type: 'textarea'
                    },
                    b: {
                        type: 'array',
                        item: {
                            desc: 'adsfaf',
                            type: 'checkbox'
                        }
                    }
                }
            }
        }
    }
    var data = {
        app: {
            blabla: [{
                foo: 1,
                bar: {
                    foo: 'adsf'
                }
            }, {
                foo: 3,
                bar: {
                    foo: 'ewrqewrq'
                }
            }],
            lala: {
                a: 1,
                b: [1,2,3]
            }
        }
    }
    debugger
    render(ui, "app", data)
    window.vueApp = new Vue({
        el: '#app',
        data
    })
})
