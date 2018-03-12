<!-- lint disable no-html -->

# Shelter

> A ~~partially~~ __working__ Express server.

## About this project
This project was an assignment for the Backend Development course at CMD, made by Titus Wormer. The assignment was to expand the current app with a working CRUD system.

### How did it go?
I must admit, I thought it would have taken me less time than it has. I had some prior experience with using Node and Express, but it seemed a little rusty. An excellent exercise! Also, I loved the cat pictures <3.
Had some issues with handling the status codes as I had never really written handlers for them manually. My lovely colleague and classmate Jonah helped me with some parts, so a big thanks to him.

Small point of feedback for the author: some images were missing ..?
### What would I have done differently?
I probably would have refactored the entire codebase to ES6 and a more OOP style with, for example, classes as an exercise for myself. Secondly, I would have liked to split up functionality (division of responsibilities) in a more MVC _(Model - View - Controller)_ style structure.

![](screenshot.png)

![](screenshot-detail.png)

## Install

Fork this repository, `cd` into it, and:

```bash
npm install
npm run build # build and minify static files
npm start # runs server on `localhost:1902`
```
## Brief description of code

```txt
build.js - crawls new data (probably not needed)
db/data.json - raw data in json format
db/image/ - images for all animals
db/index.js - interface for accessing data
db/readme.md - docs for `db`
server/ - web server
server/helpers.js - utility functions used in the views to render animals
server/index.js - express server
src/index.css - unprocessed styles
src/index.js - unprocessed scripts
static/ - output of `src` after processing (these are sent to the browser)
view/detail.ejs - ejs template for one animal
view/list.ejs - ejs template for all animals
view/error.ejs - ejs template for errors
view/add.ejs - ejs template for adding a new animal
```

## Brief description of npm scripts

*   `npm start` — Start the server (on port 1902)
*   `npm test` — Tests the database
*   `npm run lint` — Check browser code and node code for problems
*   `npm run build` — Build browser code

## Data

Data is crawled (by `build.js`) from [nycacc][].
If you have the means to do so, you should consider becoming a foster parent,
volunteering at your local animal shelter, or donating!

## License

[MIT][] © [Titus Wormer][author]

[mit]: license

[author]: http://wooorm.com

[assignment]: https://github.com/cmda-be/course-17-18/blob/master/week-4.md#shelter

[nycacc]: http://nycacc.org
