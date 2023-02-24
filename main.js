import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
// import setupEditors from "./setupEditor";

const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);
const keyValueTemplate = document.querySelector("[data-key-value-template]");
// console.log(keyValueTemplate);

const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);

document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

//intercept axios errors
axios.interceptors.request.use((req) => {
  req.customData = req.customData || {};
  req.customData.startTime = new Date().getTime();
  return req;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

function updateEndTime(res) {
  res.customData = res.customData || {};
  res.customData.time = new Date().getTime() - res.config.customData.startTime;
  return res;
}

// const { requestEditor, updateResponseEditor } = setupEditors();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairsToObject(queryParamsContainer),
    headers: keyValuePairsToObject(requestHeadersContainer),
  })
    .catch((err) => err)
    .then((res) => {
      console.log(res);
      document
        .querySelector("[data-response-section]")
        .classList.remove("d-none");
      updateResponseDetails(res);
      updateResponseEditor(res.data);
      updateResponseHeaders(res.headers);
    });
});

function updateResponseEditor(data) {
  document.querySelector("[data-json-response-body]").textContent =
    JSON.stringify(data, null, 2);
}

function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);

    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}

function updateResponseDetails(res) {
  document.querySelector("[data-status]").textContent = res.status;
  document.querySelector("[data-time]").textContent = res.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(res.data).length + JSON.stringify(res.headers).length
  );
}

function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}

function keyValuePairsToObject(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");

  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;

    if (key === "") return data;
    return { ...data, [key]: value };
  }, {});
}
