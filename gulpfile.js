const fs      = require('fs');
const path    = require('path');

const gulp          = require('gulp');
const watch         = require('gulp-watch');
const plumber       = require('gulp-plumber');
const header        = require('gulp-header');
const rename        = require('gulp-rename');
const sourcemaps    = require('gulp-sourcemaps');

const less            = require('gulp-less');
const autoprefixer    = require('gulp-autoprefixer');
const cleanCSS        = require('gulp-clean-css');

// Globals

const pkg = JSON.parse(fs.readFileSync('package.json'));

const year = (from)=>{
    let to = new Date().getFullYear();
    return to === from ? `${from}` : `${from}-${to}`;
};

const options = {
    input   : './less/*.less',
    output  : './css/',
    suffix  : '.min',
    plumber : function(err){
        if(!process.env.CI){
            console.log(err);
            this.emit('end');
        };
    },
    clean : {
        format : {
            breaks : {
                afterComment: true
            }
        }
    },
    header :
`/*!
 * ${pkg.name} v${pkg.version} (${pkg.homepage})
 * Copyright ${year(2018)} ${pkg.author}',
 * Licensed under the ${pkg.license} (http://opensource.org/licenses/${pkg.license})
 */

`,
};

// Default

gulp.task('default', ['build', 'build-min']);

// Build tasks

gulp.task('build', function(){
    let extended = gulp.src(options.input)
        .pipe(plumber(options.plumber))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(header(options.header))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(options.output));

    return extended;
});

gulp.task('build-min', function(){
    let minified = gulp.src(options.input)
        .pipe(plumber(options.plumber))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleanCSS(options.clean))
        .pipe(rename({suffix: options.suffix}))
        .pipe(header(options.header))
        .pipe(gulp.dest(options.output));

    return minified;
});

// Watch

gulp.task('watch', function () {
    gulp.watch('./less/**/*.less', ['default']);
});

// Test, used by Travis CI

gulp.task('test', ['default']);
