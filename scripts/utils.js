/**
 * @fileoverview
 * Some common utilities for scripts.
 */

module.exports = {
  // SVG icon template
  iconSvgTemplate: '<svg role="img" viewBox="0 0 24 24"'
                 + ' xmlns="http://www.w3.org/2000/svg">'
                 + '<title>%s</title><path d="%s"/></svg>',

  /**
   * Get the slug/filename for an icon.
   * @param {Object} icon The icon data as it appears in _data/simple-icons.json
   */
  getIconSlug: icon => icon.slug || module.exports.titleToSlug(icon.title),

  /**
   * Extract the path from an icon SVG content.
   * @param {Object} svg The icon SVG content
   **/
  svgToPath: svg => svg.match(/<path\s+d="([^"]*)/)[1],

  /**
   * Converts a brand title into a slug/filename.
   * @param {String} title The title to convert
   */
  titleToSlug: title => (
    title.toLowerCase()
      .replace(/\+/g, "plus")
      .replace(/\./g, "dot")
      .replace(/&/g, "and")
      .replace(/đ/g, "d")
      .replace(/ħ/g, "h")
      .replace(/ı/g, "i")
      .replace(/ĸ/g, "k")
      .replace(/ŀ/g, "l")
      .replace(/ł/g, "l")
      .replace(/ß/g, "ss")
      .replace(/ŧ/g, "t")
      .normalize("NFD")
      .replace(/[^a-z0-9]/g, "")
  ),

  /**
   * Converts a brand title in HTML/SVG friendly format into a brand title (as
   * it is seen in simple-icons.json)
   * @param {String} htmlFriendlyTitle The title to convert
   */
  htmlFriendlyToTitle: htmlFriendlyTitle => (
    htmlFriendlyTitle
      .replace(/&apos;/g, "’")
      .replace(/&amp;/g, "&")
  ),

  /**
   * Converts a brand title (as it is seen in simple-icons.json) into a brand
   * title in HTML/SVG friendly format.
   * @param {String} brandTitle The title to convert
   */
  titleToHtmlFriendly: brandTitle => (
    brandTitle
      .replace(/’/g, "&apos;")
      .replace(/&/g, "&amp;")
  ),
}
