"use strict";

const editArea = document.querySelector("div.edit-area");

const tagStyles = {};

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
    node.style = computedStyle;
  }
};

const toggleHeader = (level) => {
  const headerTag = `H${level}`;
  const className = `header${level}-text`;

  let focusNode = window.getSelection().focusNode;

  // Return focus to editArea if it is not focused.
  if (!focusNode || !editArea.contains(focusNode)) {
    editArea.focus();
    focusNode = window.getSelection().focusNode;
  }

  // Insert empty header when applied to to edit area itself or to an empty line.
  if (focusNode.className === "edit-area" || focusNode.innerText === "\n") {
    document.execCommand(
      "insertHTML",
      false,
      // Style fix to enable cursor.
      `<${headerTag} style="display:block;min-height:1px"></${headerTag}>`
    );
    applyClassNameAndStyles(window.getSelection().focusNode, className);

    editArea.focus();
    return;
  }

  const currentTag = focusNode.parentNode.nodeName;

  if (headerTag === currentTag) {
    document.execCommand("formatBlock", false, "DIV");
    const newNode = window.getSelection().focusNode.parentNode;
    newNode.className = undefined;
    newNode.style = undefined;
  } else {
    document.execCommand("formatBlock", false, headerTag);
    const newNode = window.getSelection().focusNode.parentNode;
    applyClassNameAndStyles(newNode, className);
  }

  editArea.focus();
};

const h1Button = document.querySelector("button.head-1");
h1Button.addEventListener("click", () => toggleHeader(1));

const h2Button = document.querySelector("button.head-2");
h2Button.addEventListener("click", () => toggleHeader(2));

const toggleTextStyle = (textStyle, className) => {
  document.execCommand(textStyle, false);
  editArea.focus();
};

const boldButton = document.querySelector("button.bold");
boldButton.addEventListener("click", () => toggleTextStyle("bold"));

const italicButton = document.querySelector("button.italic");
italicButton.addEventListener("click", () => toggleTextStyle("italic"));
