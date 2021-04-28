const path    = require('path');
const { I18n } = require('i18n');

function  languageHelper(request, response, next) {
    const i18n = new I18n({
        defaultLocale: 'en',
        extension: '.json',
        locales: ['en', 'si', 'ta'],
        updateFiles: false,
        autoReload: true,
        directory: './locales'
	});
	return i18n;
}

module.exports = {
    languageHelper
};