$(document).ready(()=>{
    fetchJSON("settings.json", settings=>{
        fetchJSON("locale.json", locale=>{
            const v = new yavl(
                settings.form,
                settings.fields,
                locale,
                validate,
                invalidate
            );
            $(settings.form).submit(event=>{
                v.validateForm(event);
            });
        });
    });
});


function validate(error_selector){
    document.querySelector(error_selector).innerHTML = "";
}

function invalidate(event, error_selector, error_message){
    event.preventDefault();
    document.querySelector(error_selector).innerHTML = error_message;
    return true;
}