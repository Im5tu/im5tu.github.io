/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../**/*.html",
    "../../**/*.md"
  ],
  theme: {
    extend: {},
  },
  plugins: [
  ]
}

/** npx tailwindcss -w -o ../../assets/app.css -i base.css -w */
/** npx tailwindcss -w -o ../../assets/app.css -i base.css --minify */