formLogin.addEventListener("input", async () => {
  await validate(formLogin, formLoginLabel, async () => {
    let uri = "/users";
    const params = new URLSearchParams();
    params.append('login', formLogin.value);
    const res = await axios.get(uri + '?' + params);
    return !!res.data.exists;
  }, "Логин уже существует");

  updateBtnState();
});

formBtn.addEventListener("click", async () => {
  const uri = "/reg";
  const params = {
      login: formLogin.value,
      password: formPassword.value,
  };
  const res = await axios.post(uri, params);
  toast(res.data.success);
  if (res.data.success) {
    formLogin.value = '';
    formPassword.value = '';
    updateBtnState();
  }
});
