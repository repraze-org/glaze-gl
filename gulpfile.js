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

const common = {
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

gulp.task('default', ['build', 'build-min', 'build-docs']);

// Build CSS

gulp.task('build', function(){
    let extended = gulp.src('./less/*.less')
        .pipe(plumber(common.plumber))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(header(common.header))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./css/'));

    return extended;
});

// Build minified CSS

gulp.task('build-min', function(){
    let minified = gulp.src('./less/*.less')
        .pipe(plumber(common.plumber))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleanCSS(common.clean))
        .pipe(rename({suffix: '.min'}))
        .pipe(header(common.header))
        .pipe(gulp.dest('./css/'));

    return minified;
});

// Build docs

gulp.task('build-docs', function(){
    let minified = gulp.src('./docs/less/*.less')
        .pipe(plumber(common.plumber))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleanCSS(common.clean))
        .pipe(rename({suffix: '.min'}))
        .pipe(header(common.header))
        .pipe(gulp.dest('./docs/css/'));

    return minified;
});

// Watch

gulp.task('watch', function(){
    gulp.watch('./less/**/*.less', ['default']);
    gulp.watch('./docs/less/**/*.less', ['build-docs']);
});

// Test, used by Travis CI

gulp.task('test', ['default']);
