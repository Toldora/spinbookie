import "./ubid.js";
const ubid = window.customRequire("ubid");

const signUpRef = document.querySelector(".js-sign-up");
const closeBtnRef = signUpRef.querySelector(".js-close-btn");
const formRef = document.forms.signUp;

const state = {
  isOpenedModal: false,
  isValid: false,
  isSubmitLoading: false,
};

const getBrowserId = async () => {
  let browserId = "";
  await ubid.get((error, signatureData) => {
    if (error) {
      formRef.innerHTML = JSON.stringify(error, null, 2);
      return;
    }

    browserId = signatureData.browser.signature;
  });
  return browserId;
};

const getIP = async () =>
  await fetch("https://ipinfo.io/json?token=0157ec91a1bc66").then((res) =>
    res.json()
  );

const validate = () => {
  const { email, submitBtn, agreeCheck } = formRef;
  if (!email || !agreeCheck || !submitBtn) return;

  const isValid = email.validity.valid && agreeCheck.checked;

  state.isValid = isValid;

  if (isValid) {
    submitBtn.classList.remove("sign-up__submit-btn--disabled");
  } else {
    submitBtn.classList.add("sign-up__submit-btn--disabled");
  }
};

const onInput = () => {
  validate();
};
const onChangeCheckbox = () => {
  validate();
};
const onSubmit = async (event) => {
  event.preventDefault();

  try {
    if (!state.isValid || state.isSubmitLoading) return;

    state.isSubmitLoading = true;
    formRef.fieldset.disabled = true;
    formRef.submitBtn.textContent = "Carregando...";

    formRef.style.minHeight = `${formRef.clientHeight}px`;

    const browserId = await getBrowserId();
    const { ip } = await getIP();

    const body = JSON.stringify({
      name: "spinbookie",
      email: formRef.email.value,
      browserId,
      ip,
    });

    const response = await fetch(
      "https://idyllic-eclair-f22d90.netlify.app/api/sign-up",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }
    );
    const data = await response.json();
    if (response.ok) {
      formRef.innerHTML = `<h2 class="sign-up__title">Junte-se a nós</h2>
      <div>Sucesso! Entraremos em contato em breve.</div>`;
    } else {
      const errorRef = formRef.querySelector(".js-email-error");
      errorRef.textContent = data.messagePt || data.message;
      errorRef.classList.add("sign-up__email-error--visible");
    }
  } catch (error) {
    formRef.innerHTML = JSON.stringify(error, null, 2);
  } finally {
    state.isSubmitLoading = false;
    if (formRef.fieldset) {
      formRef.fieldset.disabled = false;
    }
    if (formRef.submitBtn) {
      formRef.submitBtn.textContent = "Inscrever-se";
    }
  }
};

const preventLinks = (clickEvent, targetElement) => {
  clickEvent.preventDefault();
  if (!targetElement || targetElement.tagName === "A") return;

  preventLinks(clickEvent, targetElement.parentNode);
};

const openModal = () => {
  signUpRef.classList.add("sign-up__overlay--animation");
  signUpRef.classList.remove("sign-up__overlay--hidden");

  document.removeEventListener("click", onClickDocument);

  signUpRef.addEventListener("click", onClickOverlay);
  closeBtnRef.addEventListener("click", closeModal);

  history.replaceState({}, "", window.location.origin);

  state.isOpenedModal = true;
};

const closeModal = (event) => {
  event.stopPropagation();

  signUpRef.classList.remove("sign-up__overlay--animation");
  signUpRef.classList.add("sign-up__overlay--hidden");

  signUpRef.removeEventListener("click", onClickOverlay);
  closeBtnRef.removeEventListener("click", closeModal);

  document.addEventListener("click", onClickDocument);

  history.replaceState({}, "", window.location.origin);

  state.isOpenedModal = false;
};

const onClickOverlay = (event) => {
  if (event.target !== event.currentTarget || !state.isOpenedModal) return;

  closeModal(event);
};

const onClickDocument = (event) => {
  preventLinks(event, event.target);

  if (state.isOpenedModal) return;

  openModal();
};

document.addEventListener("click", onClickDocument);
formRef.email.addEventListener("input", onInput);
formRef.agreeCheck.addEventListener("change", onChangeCheckbox);
formRef.addEventListener("submit", onSubmit);
