/**
 * Created by jin on 2017/7/23.
 */

/**
 * 替换所有匹配exp的字符串为指定字符串
 * @param exp 被替换部分的正则
 * @param newStr 替换成的字符串
 */
String.prototype.replaceAll = function (exp, newStr) {
    return this.replace(new RegExp(exp, "gm"), newStr);
};

/**
 * 原型：字符串格式化
 * @param args 格式化参数值
 */
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments; // 如果模板参数是数组
    if (arguments.length === 1 && typeof (args) === "object") {
        // 如果模板参数是对象
        data = args;
    }
    for ( var key in data) {
        var value = data[key];
        if (undefined !== value) {
            result = result.replaceAll("\\{" + key + "\\}", value);
        }
    }
    return result;
};

var object_field_id_max = 1;

var objectTmpl = function () {
    return '<fieldset id="{field_id}" class="json_class">' +
        '<legend><span>[-]</span><label for="json_key"></label>  <input class="json_key" type="text" placeholder="key_{field_id}"></legend>' +
        '<label for="json_type"></label>' +
        '<select class="json_type" id="json_type">' +
        '<option value="object">Object</option>' +
        '<option value="array">Array</option>' +
        '<option value="string">String</option>' +
        '<option value="number">Number</option>' +
        '<option value="boolean">Boolean</option>' +
        '</select>' +
        '<div class="json_operators">' +
        '<span></span>' +
        '<button class="json_add" type="button">ADDCHILD</button>' +
        '<button class="json_del" type="button">DEL</button>' +
        '</div>' +
        '<div class="json_value">' +
        '</div>' +
        '</fieldset>';
};

var objectContentTmpl = function () {
    return '<div class="json_object"></div>';
};

var arrayContentTmpl = function () {
    return '<div class="json_array"></div>';
};

var stringTmpl = function () {
    return '<label for="json_string"></label><input class="json_string" type="text" >';
};

var numberTmpl = function () {
    return '<label for="json_number"></label><input class="json_number" type="number" >';
};

var booleanTmpl = function (id) {
    var tmpl = '<input class="json_boolean" type="radio" name="{name}" value="0" id="json_true" checked><label for="json_true">false</label>' +
        '<input class="json_boolean" type="radio" name="{name}" value="1" id="json_false" ><label for="json_false">true</label>';
    return tmpl.format({ name : 'boolean'+id });
};

var typeValueTmpl = {
    'object' : objectContentTmpl,
    'array' : arrayContentTmpl,
    'string' : stringTmpl,
    'number' : numberTmpl,
    'boolean' : booleanTmpl
};

function JsonElemObj(root) {

    this.getFieldId = function () {
        return this.fieldId;
    };

    this.getTmpl = function () {
        return this.tmpl;
    };

    this.setJsonElem = function (jsonElem) {
        this.jsonElem = jsonElem;
        this.setValue(typeValueTmpl[this.jsonType](this.fieldId));
        var jsonElemObj = this;

        jsonElem.find('.json_type').change(function () {
            var jsonType = $(this).val();
            jsonElemObj.setType(jsonType).setValue(typeValueTmpl[jsonType](jsonElemObj.fieldId));
        });

        jsonElem.find('.json_add').click(function () {
            jsonElemObj.addContent(new JsonElemObj());
        });

        jsonElem.find('.json_del').click(function () {
            jsonElemObj.remove();
        });

        return this;
    };

    this.jsonKey = function () {
        return this.jsonElem.find('.json_key').val();
    };

    this.setType = function (typeStr) {
        this.jsonType = typeStr;
        this.jsonElem.find('.json_type')
            .find('option[value="{type}"]'.format({ type : typeStr}))
            .attr('selected', true);
        if (typeStr === 'object') {
            this.jsonElem.find('.json_key').prop('disabled', false);
            this.jsonElem.find('.json_add').prop('disabled', false);
        } else if (typeStr === 'array') {
            this.jsonElem.find('.json_key').prop('disabled', false);
            this.jsonElem.find('.json_add').prop('disabled', false);
        } else {
            this.jsonElem.find('.json_key').prop('disabled', false);
            this.jsonElem.find('.json_add').prop('disabled', true);
        }
        if (this.parentElemObj.getType() === 'array') {
            this.jsonElem.find('.json_key').prop('disabled', true);
        }
        return this;
    };

    this.getType = function () {
        return this.jsonType;
    };

    this.setValue = function (tmpl) {
        if (this.jsonValue === undefined) {
            this.jsonValue = this.jsonElem.find('.json_value').append(tmpl);
        } else {
            this.jsonValue.children().remove();
            this.jsonValue.append(tmpl);
        }
        return this;
    };

    this.getValue = function () {
        return this.jsonValue;
    };

    this.addContent = function (jsonElemObj) {
        this.childrenElemObj.push(jsonElemObj);
        jsonElemObj.parentElemObj = this;
        return jsonElemObj.setJsonElem(this.jsonValue
            .find('div')
            .first()
            .append(jsonElemObj.getTmpl())
            .find('#field_' + jsonElemObj.getFieldId())).setType('object');
    };

    this.delContent = function (jsonElemObj) {
        this.childrenElemObj.splice(this.childrenElemObj.findIndex(function (element) {
            return element === jsonElemObj;
        }), 1);
        jsonElemObj.jsonElem.remove();
        return this;
    };

    this.remove = function () {
        if (this.parentElemObj !== null) {
            this.parentElemObj.delContent(this);
            this.parentElemObj = null;
        }
    };

    this.toJson = function () {
        var jsonKey = this.jsonKey();
        var jsonData = {};
        if (this.jsonType === 'object') {
            jsonData[jsonKey] = {};
            this.childrenElemObj.forEach(function (elemObj) {
                if (elemObj.jsonKey() in jsonData[jsonKey]) {
                    alert('duplicated key "' + elemObj.jsonKey() + '" in "' + jsonKey + '"');
                    return;
                }
                jsonData[jsonKey][elemObj.jsonKey()] = elemObj.toJson()[elemObj.jsonKey()];
            });
        } else if (this.jsonType === 'array') {
            jsonData[jsonKey] = [];
            this.childrenElemObj.forEach(function (elemObj) {
                jsonData[jsonKey].push(elemObj.toJson()[elemObj.jsonKey()]);
            });
        } else if (this.jsonType === 'string') {
            jsonData[jsonKey] = this.getValue().find('.json_string').val();
        } else if (this.jsonType === 'number') {
            var numberStr = this.getValue().find('.json_number').val();
            if (numberStr.indexOf('.') >= 0) {
                jsonData[jsonKey] = parseFloat(numberStr);
            } else {
                jsonData[jsonKey] = parseInt(numberStr);
            }
        } else if (this.jsonType === 'boolean') {
            jsonData[jsonKey] = this.getValue().find('.json_boolean').val() === 1;
        }
        return jsonData;
    };

    this.tmpl = objectTmpl().format({ field_id : 'field_' + object_field_id_max });
    this.fieldId = object_field_id_max;
    this.jsonType = 'object';
    this.parentElemObj = null;
    this.childrenElemObj = [];
    object_field_id_max ++;

    if (root !== undefined) {
        this.setJsonElem($(root).append(this.tmpl).find('#field_' + this.fieldId)).setValue(objectContentTmpl());
        this.jsonElem.find('.json_key').prop('disabled', true);
        this.jsonElem.find('.json_key').attr('placeholder', 'root');
        this.jsonElem.find('.json_type').prop('disabled', true);
        this.jsonElem.find('.json_del').prop('disabled', true);
    }
}

$(window).ready(function () {
    var root = new JsonElemObj('form');

    $('#generate').click(function () {
        $('#output').text(JSON.stringify(root.toJson()[''], null, 20));
    });

    $(document).on('click', 'legend span', function () {
        var self = $(this).parent();
        self.siblings().slideToggle(200);
        if (self.hasClass('off')) {
            self.removeClass('off').find('span').text('[-]');
        } else {
            self.addClass('off').find('span').text('[+]');
        }
    });
});