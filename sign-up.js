import "./ubid.js";
const ubid = window.customRequire("ubid");

const signUpRef = document.querySelector(".js-sign-up");
const closeBtnRef = signUpRef.querySelector(".js-close-btn");
const formRef = document.forms.signUp;

const state = {
  isOpenedModal: false,
  isValid: false,
};

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
    if (!state.isValid) return;

    const modalRef = signUpRef.querySelector(".js-sign-up-modal");
    modalRef.style.height = `${modalRef.clientHeight}px`;

    const body = JSON.stringify({
      email: formRef.email.value,
      name: "copagol",
    });

    await ubid.get((error, signatureData) => {
      if (error) {
        formRef.innerHTML = JSON.stringify(error, null, 2);
        return;
      }

      formRef.innerHTML = `${JSON.stringify(
        signatureData,
        null,
        2
      )} <br/><br/>`;
    });

    const res = await fetch(
      "https://idyllic-eclair-f22d90.netlify.app/api/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }
    );
    const user = await res.json();

    formRef.innerHTML =
      formRef.innerHTML +
      `${user?.user?.email} <br/><br/> ${window.navigator.userAgent}`;
  } catch (error) {
    console.log("ERROR: ", error);
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
