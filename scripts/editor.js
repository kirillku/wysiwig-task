"use strict";

const editArea = document.querySelector("div.edit-area");

const tagStyles = {};

// Calculate computed styles and set them inline to allow copying text with markup to MS Word Online.
const applyClassNameAndStyles = (node, className) => {
  const style = tagStyles[node.nodeName];

  if (style) {
    node.className = className;
    node.style = style;
  } else {
    const defaultStyleChunks = window.getComputedStyle(node).cssText.split(";");
    node.className = className;
    const computedStyle = window
      .getComputedStyle(node)
      .cssText.split(";")
      .filter((chunk, i) => chunk !== defaultStyleChunks[i])
      .join(";");
    tagStyles[node.nodeName] = computedStyle;
    node.style = [computedStyle, node.style.cssText].join(";");
  }
};

const applyHeader = (level) => {
  const headerTag = `H${level}`;
  const className = `header${level}-text`;

  let focusNode = window.getSelection().focusNode;

  // Only apply header when there is a selection in the editor.
  if (
    !focusNode ||
    !editArea.contains(focusNode) ||
    focusNode.className === "edit-area" ||
    focusNode.innerText === "\n"
  ) {
    editArea.focus();
    return;
  }

  try {
    // Try to apply header inline.
    const range = window.getSelection().getRangeAt(0);
    const header = document.createElement(headerTag);
    range.surroundContents(header);
    applyClassNameAndStyles(header, className);
  } catch {
    // If range includes a non-text node, apply temp tag and then convert to header.
    document.execCommand("fontName", false, "temp");
    editArea.querySelectorAll("font").forEach((element) => {
      const header = document.createElement(headerTag);
      header.innerHTML = element.innerHTML;
      element.replaceWith(header);
      applyClassNameAndStyles(header, className);
    });
  }

  editArea.focus();
};

const h1Button = document.querySelector("button.head-1");
h1Button.addEventListener("click", () => applyHeader(1));

const h2Button = document.querySelector("button.head-2");
h2Button.addEventListener("click", () => applyHeader(2));

const toggleTextStyle = (textStyle, className) => {
  document.execCommand(textStyle, false);
  editArea.focus();
};

const boldButton = document.querySelector("button.bold");
boldButton.addEventListener("click", () => toggleTextStyle("bold"));

const italicButton = document.querySelector("button.italic");
italicButton.addEventListener("click", () => toggleTextStyle("italic"));

const replaceElement = (element, newTag) => {
  const newElement = document.createElement(newTag);
  newElement.innerHTML = element.innerHTML;
  element.replaceWith(newElement);
  return newElement;
};

// When using `node.childNodes` straight, some nodes could be skipped if others are removed.
const getChildNodes = (node) => [...node.childNodes];

editArea.addEventListener("paste", (event) => {
  event.preventDefault();

  const html = event.clipboardData.getData("text/html");

  if (!html) {
    const text = event.clipboardData.getData("text/plain");

    const textNode = document.createTextNode(text);

    const range = window.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(textNode);
    range.collapse();

    return;
  }

  const domParser = new DOMParser();
  const body = domParser
    .parseFromString(event.clipboardData.getData("text/html"), "text/html")
    .querySelector("body");

  function clearElement(element) {
    switch (true) {
      case element.nodeName === "#text":
        return;
      case element.nodeName === "H1": {
        const header = replaceElement(element, "H1");
        applyClassNameAndStyles(header, "header1-text");
        getChildNodes(header).forEach(clearElement);
        return;
      }
      case /H[2-6]/.test(element.nodeName): {
        const header = replaceElement(element, "H2");
        applyClassNameAndStyles(header, "header2-text");
        getChildNodes(header).forEach(clearElement);
        return;
      }
      case element.nodeName === "I" || element.style.fontStyle === "italic": {
        const italic = replaceElement(element, "I");
        getChildNodes(italic).forEach(clearElement);
        return;
      }
      case ["B", "STRONG"].includes(element.nodeName) ||
        ["bold", "700"].includes(element.style.fontWeight): {
        const bold = replaceElement(element, "B");
        getChildNodes(bold).forEach(clearElement);
        return;
      }
      case ["DIV", "SPAN", "P"].includes(element.nodeName): {
        const newElement = replaceElement(element, element.nodeName);
        getChildNodes(newElement).forEach(clearElement);
        return;
      }
      default:
        element.remove();
        return;
    }
  }

  getChildNodes(body).forEach(clearElement);

  const fragment = document.createDocumentFragment();
  getChildNodes(body).forEach((node) => fragment.appendChild(node));

  const range = window.getSelection().getRangeAt(0);
  range.deleteContents();
  range.insertNode(fragment);
  range.collapse();
});
