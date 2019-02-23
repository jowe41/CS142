function Cs142TemplateProcessor(template){
    this.template = template;

    Cs142TemplateProcessor.prototype.fillIn=function(dictionary) {
        var temp = this.template;
        for (var key in dictionary) {
            var re = new RegExp('\\{\\{' + key + '\\}\\}');
            temp = temp.replace(re, dictionary[key]);
        }
        temp = temp.replace(new RegExp('\\{\\{\\w+\\}\\}', "g"), "");
        return temp;
    }
    return template;
}