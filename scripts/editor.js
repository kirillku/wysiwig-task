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

editArea.addEventListener("paste", (event) => {
  event.preventDefault();

  const html = event.clipboardData.getData("text/html");

  if (!html) {
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
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
        const header = document.createElement("H1");
        header.innerHTML = element.innerHTML;
        applyClassNameAndStyles(header, "header1-text");
        element.replaceWith(header);
        header.childNodes.forEach(clearElement);
        return;
      }
      case /H[2-6]/.test(element.nodeName): {
        const header = document.createElement("H2");
        header.innerHTML = element.innerHTML;
        applyClassNameAndStyles(header, "header2-text");
        element.replaceWith(header);
        header.childNodes.forEach(clearElement);
        return;
      }
      case element.nodeName === "I" || element.style.fontStyle === "italic": {
        const italic = document.createElement("I");
        italic.innerHTML = element.innerHTML;
        element.replaceWith(italic);
        italic.childNodes.forEach(clearElement);
        return;
      }
      case ["B", "STRONG"].includes(element.nodeName) ||
        ["bold", "700"].includes(element.style.fontWeight): {
        const bold = document.createElement("B");
        bold.innerHTML = element.innerHTML;
        element.replaceWith(bold);
        bold.childNodes.forEach(clearElement);
        return;
      }
      case ["DIV", "SPAN", "P"].includes(element.nodeName): {
        const newElement = document.createElement(element.nodeName);
        newElement.innerHTML = element.innerHTML;
        element.replaceWith(newElement);
        newElement.childNodes.forEach(clearElement);
        return;
      }
      default:
        element.remove();
        return;
    }
  }

  body.childNodes.forEach(clearElement);

  document.execCommand("insertHTML", false, body.innerHTML);
});
