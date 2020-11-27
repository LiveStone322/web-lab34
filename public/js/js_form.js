formLogin.addEventListener("input", async () => {
    await validateNotEmpty(formLogin, formLoginLabel);
    
    updateBtnState();
  });
  
  formPassword.addEventListener("input", () => {
    validateNotEmpty(formPassword, formPasswordLabel);
    updateBtnState();
  });
  
  async function validateNotEmpty(field, messageField) {
    await validate(field, messageField, async () => {
      return field.value == "";
    }, "Не может быть пустым");
  }
  
  async function validate(field, messageField, validateFn, validateMessage) {
    if (await validateFn()) { //validateFn must be async!
      field.classList.add('invalid');
      messageField.innerHTML = validateMessage;
    } else if (messageField.innerHTML == '' || messageField.innerHTML == validateMessage) {
      field.classList.remove('invalid');
      messageField.innerHTML = '';
    }
  }
  
  function updateBtnState() {
    if (formLogin.value === "" || formPassword.value === "" || formLoginLabel.innerHTML !== "" || formPasswordLabel.innerHTML !== "") {
      formBtn.setAttribute('disabled', '');
    } else {
      formBtn.removeAttribute('disabled');
    }
  }