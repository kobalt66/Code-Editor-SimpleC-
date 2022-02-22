import { letters_digits } from "./Constant.js"
import { throwWarn, submitFile } from "./main.js"

window.searchToggle = searchToggle;

function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');
    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    }
    else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        var path = container.find('.search-input').val();

        if (path === '') {
            container.removeClass('active');
            container.find('.search-input').val('');
            return;
        }
        else if (Array.from(letters_digits + '/.').every(l => { return !path.includes(l); }) || path.includes(' ')) 
        {
            throwWarn("Please enter a valid file path!");
            return;
        }

        submitFile(path);
        container.removeClass('active');
        container.find('.search-input').val('');
    }
}
