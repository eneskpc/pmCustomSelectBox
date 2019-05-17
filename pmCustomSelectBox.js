(function (factory) {
    if (typeof window == 'object')
        window.PmCustomSelectBox = factory();
    else
        console.error('To use this library you need to either use browser.');
})(function () {
    "use strict"

    var initialized = false;

    var PmCustomSelectBox = function (opts) {
        this.options = Object.assign(PmCustomSelectBox.defaults, opts);
        this.init();
    }

    PmCustomSelectBox.prototype.init = function (opts) {
        this.options = opts ? Object.assign(this.options, opts) : this.options;

        if (initialized)
            this.destroy();

        if (!(this.orignal_input = document.querySelector(this.options.selector))) {
            return this;
        }

        this.currentItem = null;
        this.resultWrapper = document.createElement('div');
        this.wrapper = document.createElement('div');
        this.input = document.createElement('input');
        this.cancelButton = document.createElement('button');
        this.xhttp = new XMLHttpRequest();

        init(this);
        initEvents(this);

        initialized = true;
        return this;
    }

    PmCustomSelectBox.prototype.destroy = function () {
        this.orignal_input.removeAttribute('hidden');

        delete this.orignal_input;
        var self = this;

        Object.keys(this).forEach(function (key) {
            if (self[key] instanceof HTMLElement)
                self[key].remove();

            if (key != 'options')
                delete self[key];
        });

        initialized = false;
    }

    function init(sb) {
        sb.cancelButton.type = "button";
        sb.cancelButton.innerHTML = "&times;";
        sb.cancelButton.className = "cancel-button hide";

        sb.wrapper.classList.add(sb.options.wrapperClass);
        sb.resultWrapper.classList.add(sb.options.resultClass);
        sb.resultWrapper.classList.add("hide");

        sb.wrapper.append(sb.cancelButton);
        sb.wrapper.append(sb.input);
        sb.wrapper.append(sb.resultWrapper);

        sb.orignal_input.setAttribute('hidden', 'true');
        sb.orignal_input.parentNode.insertBefore(sb.wrapper, sb.orignal_input);
    }

    function initEvents(sb) {

        sb.cancelButton.onclick = function () {
            sb.input.disabled = false;
            sb.orignal_input.value = "";
            sb.input.value = "";
            sb.input.focus();
            sb.cancelButton.classList.add("hide");
        };

        sb.xhttp.responseType = "json";

        sb.xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                sb.resultWrapper.classList.remove("hide");
                sb.resultWrapper.innerHTML = "";
                if (this.response) {
                    var responseWithNewRecord = this.response.Data;
                    responseWithNewRecord.unshift({
                        PARAMETRE_ANAHTAR: "TBLPRM_UNVANLAR",
                        PARAMETRE_BAGLI_DEGER_ID: null,
                        PARAMETRE_BAGLI_ID: null,
                        PARAMETRE_DEGER: sb.input.value,
                        PARAMETRE_DEGER_DIL_ID: "tr",
                        PARAMETRE_DEGER_ID: 0,
                        PARAMETRE_DEGER_MAX: null,
                        PARAMETRE_DEGER_MIN: null,
                        PARAMETRE_DEGER_TIPI: "STRING",
                        PARAMETRE_ID: 0,
                        PARAMETRE_INDEX: null,
                        PARAMETRE_VARSAYILAN_DEGER: false
                    });

                    responseWithNewRecord.forEach(function (item) {
                        var resultItem = document.createElement("a");
                        resultItem.href = "#";
                        resultItem.className = item.PARAMETRE_DEGER_ID != 0 ? sb.options.resultItemClass : sb.options.newItemClass;
                        resultItem.innerHTML = item.PARAMETRE_DEGER_ID == 0 ? "<strong>" + item.PARAMETRE_DEGER.trim().toLocaleUpperCase() + "</strong> değeri ile devam et." : item.PARAMETRE_DEGER;
                        resultItem.setAttribute("data-id", item.PARAMETRE_DEGER_ID);
                        resultItem.addEventListener('click', function (event) {
                            event.preventDefault();
                            if (this.getAttribute('data-id') != 0) {
                                sb.orignal_input.value = this.getAttribute('data-id') + ";" + this.innerText.replace(/;/g, '');
                                sb.input.value = this.innerText.replace(/;/g, '');
                            } else {
                                sb.orignal_input.value = "0;" + this.querySelector('strong').innerText.replace(/;/g, '');
                                sb.input.value = this.querySelector('strong').innerText.replace(/;/g, '');
                            }
                            sb.input.disabled = true;
                            sb.resultWrapper.classList.add("hide");
                            sb.cancelButton.classList.remove("hide");
                        });
                        resultItem.addEventListener('keydown', function (e) {
                            if (e.keyCode == 13) {//enter
                                e.preventDefault();
                                sb.currentItem.click();
                            } else if (e.keyCode == 38) {//up
                                e.preventDefault();
                                if (sb.currentItem.previousSibling)
                                    sb.currentItem = sb.currentItem.previousSibling;
                                sb.currentItem.focus();
                            } else if (e.keyCode == 40) {//down
                                e.preventDefault();
                                if (sb.currentItem.nextSibling)
                                    sb.currentItem = sb.currentItem.nextSibling;
                                sb.currentItem.focus();
                            }
                        });
                        sb.resultWrapper.append(resultItem);
                        if (item.PARAMETRE_DEGER_ID == 0) {
                            sb.currentItem = resultItem;
                        }
                    });
                }
            }
        };

        sb.resultWrapper.addEventListener('keydown', function (event) {
            event.preventDefault();
        });

        sb.input.addEventListener('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
            }
        });

        sb.input.addEventListener('input', function (e) {
            if (sb.input.value) {
                if (sb.resultWrapper.classList.contains("hide"))
                    sb.resultWrapper.classList.remove("hide");
                var params = "?filter=" + sb.input.value;
                sb.xhttp.open("GET", sb.options.ajax.url + params, true);
                sb.xhttp.send();
            } else {
                if (!sb.resultWrapper.classList.contains("hide"))
                    sb.resultWrapper.classList.add("hide");
            }
        });

        sb.input.addEventListener('keydown', function (e) {
            if (e.keyCode == 40) {//down
                e.preventDefault();
                sb.currentItem.focus();
            }
        });
    }

    PmCustomSelectBox.defaults = {
        selector: null,
        wrapperClass: 'custom-selectbox-wrapper',
        resultClass: 'custom-selectbox-result-wrapper',
        resultItemClass: 'custom-selectbox-item',
        newItemClass: 'custom-selectbox-new-item',
        ajax: {
            url: null,
            method: 'GET'
        }
    }

    return PmCustomSelectBox;
});