var lang = 'en';

function getLang() {
  return lang;
}

function setLang(langCode) {
  lang = langCode;
}

function localImage(name) {
  return 'assets/img/' + lang + '/' + name;
}

module.exports = {
  setLang: setLang,
  getLang: getLang,
  localImage: localImage
};