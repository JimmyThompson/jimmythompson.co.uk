task :clean do
  sh('rm -rf _site')
end

task :deep_clean => [:clean] do
  sh('rm -rf gems')
end

task :dependencies do
  sh('bundle install --path gems')
end

task :dev => [:clean, :dependencies] do
  sh('bundle exec jekyll serve --drafts')
end

task :live => [:clean, :dependencies] do
  sh('bundle exec jekyll serve')
end
