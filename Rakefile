verbose false

OUTPUT_PATH = 'dist'

CLEAN = FileList[OUTPUT_PATH]
HTML = FileList[File.join(OUTPUT_PATH, '/*.html')]
JS = FileList[File.join(OUTPUT_PATH, '/js/*.js')]
CSS = FileList[File.join(OUTPUT_PATH, '/css/*.css')]

task :default => :build

desc "Builds the site from scratch"
task :build => ['clean', 'copy', 'minify']

desc "Cleans output directory"
task :clean => :dist do
  CLEAN.each do |f|
    sh 'rm ' + ('-r ' if File.directory? f) + f
  end
end

directory 'dist'
directory 'dist/js'
directory 'dist/css'
directory 'dist/img'

task :copy => ['dist', 'dist/css', 'dist/js', 'dist/img'] do
  cp 'index.html', 'dist'
  cp 'css/s.css',  'dist/css'
  cp 'js/s.js',    'dist/js'
  cp 'img/i.png',  'dist/img'
end

desc "Minifies everything"
task :minify => ['minify:html', 'minify:js', 'minify:css']

namespace "minify" do

  desc "Minifies HTML files in output directory"
  task :html do
    HTML.each do |file|
     run_on_file 'java -jar lib/htmlcompressor-0.9.1.jar --remove-intertag-spaces --remove-quotes', file
    end
  end

  desc "Minifies JavaScript files using Google Closure Compiler"
  task :js do
    JS.each do |file|
     # run_on_file 'java -jar lib/compiler.jar --js', file
     run_on_file 'java -jar lib/yuicompressor-2.4.2.jar', file
    end
  end

  desc "Minifies CSS files using YUI Compressor"
  task :css do
    CSS.each do |file|
     run_on_file 'java -jar lib/yuicompressor-2.4.2.jar', file
    end
  end

  def run_on_file(command, file)
     sh "#{command} #{file} > .tmp"
     sh "cp .tmp #{file}"
     sh "rm .tmp"
  end

end

