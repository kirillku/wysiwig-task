"use strict";

const editArea = document.querySelector("div.edit-area");

const toggleTag = (replaceTag, defaultTag = "DIV") => {
  const currentTag = document.getSelection().focusNode.parentNode.nodeName;
  const tag = replaceTag === currentTag ? defaultTag : replaceTag;
  document.execCommand("formatBlock", false, tag);
  editArea.focus();
};

const h1Button = document.querySelector("button.head-1");
h1Button.addEventListener("click", () => toggleTag("H1"));

const h2Button = document.querySelector("button.head-2");
h2Button.addEventListener("click", () => toggleTag("H2"));

const toggleTextStyle = (textStyle) => {
  document.execCommand(textStyle, false);
  editArea.focus();
};

const boldButton = document.querySelector("button.bold");
boldButton.addEventListener("click", () => toggleTextStyle("bold"));

const italicButton = document.querySelector("button.italic");
italicButton.addEventListener("click", () => toggleTextStyle("italic"));
