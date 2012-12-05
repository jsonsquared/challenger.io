require 'capistrano/ext/multistage'
load 'deploy' if respond_to?(:namespace) # cap2 differentiator
set :stages, %w(prod)
set :default_stage, "prod"

set :application, "pewpew"
set :node_file, "server.js"

set :repository, "git@github.com:jsonsquared/challenger.io.git"
set :branch, "master"
set :deploy_to, "/www/#{application}"

set :keep_releases, 5
set :scm, :git
set :deploy_via, :remote_cache
set :normalize_asset_timestamps, false
# default_run_options[:shell] = 'bash'

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do
    run "service #{application} start"
  end

  task :stop, :roles => :app, :except => { :no_release => true } do
    run "service #{application} stop"
  end

  task :restart, :roles => :app, :except => { :no_release => true } do
    run "service #{application} restart || service #{application} start"
  end

  task :install_dependent_packages, :roles => :app do
    run "cd #{release_path} && npm install --production --quiet"
  end

  task :migrate do
  end
end

after 'deploy:update_code', 'deploy:install_dependent_packages'
after 'deploy', 'deploy:cleanup'