module.exports = function (grunt) {

  // Configuration du build
  grunt.initConfig({

    // Parametrage

    package: grunt.file.readJSON('package.json'),

    src: {
      html: {
        root: '',
        all:  '**/*.html'
      },
      assets: 'assets',
      scss: {
        all:  'scss/**/*.scss'
      },
      css: {
        all:  'css/**/*.css'
      },
      js: {
        app:  'javascript/**/*.js'
      }
    },
    

    // Configuration des taches

    sass: {
      dev: {
        files: {
          '<%= src.css.app %>': '<%= src.scss.app %>'
        }
      }
    },

    compass:{
        
        dev: {
            options:{
                sassDir: 'scss',
                sourcemap: true,
                cssDir : 'css'
            }
        }
        
    },

    

    // Configuration du watch : compilation sass + livereload sur modif sass et html

    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: ['<%= src.scss.all %>'],
        tasks: ['compass']
      },
      html: {
        files: ['<%= src.html.all %>']
      },
      javascript: {
        files: ['<%= src.js.app %>']
      }
    },

    nodemon: {
      dev:{
        script : 'server.js'
      }
    },

    concurrent: {
      serve : ['nodemon', 'compass', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }

  });

  // Chargement des plugins
  require('load-grunt-tasks')(grunt);
  
  // Declaration des taches
  grunt.registerTask('serve',        ['concurrent:serve']);
  
};
