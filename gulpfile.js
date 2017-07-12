/*jshint esversion: 6 */
/*
 * Copyright (C) 2017  luffah<contact@luffah.xyz>
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
//require("es6-promise").polyfill();
//const fs = require('fs');
const gulp = require("gulp");
const file = require('gulp-file');
const del = require("del");
const concat = require("gulp-concat");
const inject = require('gulp-inject');
const htmlminifier = require("gulp-html-minifier");
const uglify = require('gulp-uglify');
const postcss = require("gulp-postcss");
var postcss_plugins = [
  require("autoprefixer"),
  require("cssnano")
];

const po2json = require('po2json');
var languages=['fr','en'];


function _make_all(){
//  var clean=false;
//  while (!clean){
//   try {
//     fs.statSync('tmp');
//     fs.statSync('webroot');
//     console.log('Waiting _clean to finish');
//   } catch (e) {
//     clean=true;
//   }
//  }
  var dialogs=_dialogs(languages);
  var js=_js();
  var css=_css();
  var images=_images();
  var html=_html(dialogs,images,js,css);
  
}
function _js(){
  /*
   * JS (without dialogs)
   */
  return gulp.src([
    'src/js/engine/jquery-1.9.1.min.js',
    'src/js/engine/jquery.terminal*.js',
    'src/js/engine/Gettext.js',
    'src/js/engine/GameState.js',
    'src/js/engine/EventTarget.js',
    'src/js/engine/Room.js',
    'src/js/engine/Item.js',
    'src/js/terminus.js'
  ])
    .pipe(concat('min.js'))
    .pipe(uglify());

}

function _css(){
  /*
   * CSS
   */
  return gulp.src("src/css/*.css")
    .pipe(concat('min.css'))
    .pipe(postcss(postcss_plugins));
}

function _images(){
  /*
   * Images
   */
  return gulp.src('src/img/*')
    .pipe(gulp.dest('webroot/img/'));
}

function _filter_dialogs(jsonData){
  var ret={};
  for (j in jsonData){
    if (i) {
      ret[j]=jsonData[j][1];
    }
  }
  return ret;
}

function _dialogs(tlang){
  /*
   * Translations / text
   */
  var jsonData = {};
  for (i in tlang){
    try {
      jsonData[tlang[i]] = 'var dialog=' + JSON.stringify(
        _filter_dialogs(
          po2json.parseFileSync('src/js/terminus.'+tlang[i]+'.po')
        )
      ) +';';
      file("terminus.dialog."+tlang[i]+".js",
        "//Warning this file is autogenerated \n"+jsonData[tlang[i]],
        {src:true})
        .pipe(gulp.dest('src/js/'));
    } catch (e) {
      console.log(e);
    }
  }
  return jsonData;
}


function _html(lang,images,js,css){
  /*
   * HTML
   */
  for (i in lang){
    var inject_def_css =  { transform:
      function (filePath, file) {
        return '<style>'+file.contents.toString('utf8')+'</style>'; }
    };
    var inject_def_js =  { transform:
      function (filePath, file) { 
        return '<script>' + lang[i] +
          file.contents.toString('utf8') +
          '</script>';
      }
    };
    gulp.src('src/*.html')
      .pipe(htmlminifier({collapseWhitespace: true}))
      .pipe(inject(css, inject_def_css))
      .pipe(inject(js, inject_def_js))
      .pipe(concat("terminus."+i+".html"))
      .pipe(gulp.dest("webroot/"));
  }
  return true;
}

function _clean(){
  return del.sync(['webroot']); 
}

gulp.task('clean', _clean);
gulp.task('makeall', ['clean'], _make_all);
gulp.task('default', ['makeall']);
