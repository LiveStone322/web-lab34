formBtn.addEventListener("click", async () => {
  const uri = "/login";
  const params = {
      login: formLogin.value,
      password: formPassword.value,
  };
  const res = await axios.post(uri, params);
  console.log(res);
  toast(res.data.success);
  if (res.data.success) {
    formLogin.value = '';
    formPassword.value = '';
    updateBtnState();
  }
});