const formLogin = document.getElementById("form__login");
const formPassword = document.getElementById("form__password");
const formBtn = document.getElementById("form__btn");
const formLoginLabel = document.getElementById("form__login_label");
const formPasswordLabel = document.getElementById("form__password_label");

function toast(expr) {
    if (expr) {
        M.toast({html: 'Успешно!'});
    } else {
        M.toast({html: 'Неудачно :('});
    }
}