"use strict";

const editArea = document.querySelector("div.edit-area");

const toggleHeader = (level) => {
  const headerTag = `H${level}`;
  const className = `header${level}-text`;
  const currentTag = document.getSelection().focusNode.parentNode.nodeName;

  if (headerTag === currentTag) {
    document.execCommand("formatBlock", false, "DIV");
  } else {
    document.execCommand("formatBlock", false, headerTag);
    document.getSelection().focusNode.parentNode.className = className;
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
