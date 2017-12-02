task :clean do
  sh('rm -rf _site')
end

task :deep_clean => [:clean] do
  sh('rm -rf vendor')
end

task :dependencies do
  sh('bundle install --path vendor')
end

task :build => [:clean] do
  sh('bundle exec jekyll build')
end

task :dev => [:clean, :dependencies] do
  sh('bundle exec jekyll serve --drafts')
end

task :live => [:clean, :dependencies] do
  sh('bundle exec jekyll serve')
end
